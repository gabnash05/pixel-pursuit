import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';
import {
    DatabaseInstance,
    DatabaseInstanceEngine,
    PostgresEngineVersion,
    Credentials,
} from 'aws-cdk-lib/aws-rds';
import {
    Vpc,
    SecurityGroup,
    Peer,
    Port,
    SubnetType,
    InstanceType,
    InstanceClass,
    InstanceSize,
    ISecurityGroup,
    Instance,
    UserData,
    MachineImage,
    KeyPair,
} from 'aws-cdk-lib/aws-ec2';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { CfnOutput, RemovalPolicy, StackProps } from 'aws-cdk-lib';
import { config } from '../config/dev';

interface CombinedStackProps extends StackProps {
    vpc: Vpc;
}

export class BackendStack extends cdk.Stack {
    public readonly dbInstance: DatabaseInstance;
    public readonly backendInstance: Instance;

    constructor(scope: Construct, id: string, props: CombinedStackProps) {
        super(scope, id, props);

        const { vpc } = props;

        // Database Security Group
        const dbSecurityGroup = new SecurityGroup(this, 'DbSecurityGroup', {
            vpc,
            description: 'Security group for PostgreSQL database',
            allowAllOutbound: true,
        });

        dbSecurityGroup.addIngressRule(
            dbSecurityGroup, 
            Port.tcp(5432), 
            'Allow self'
        );

        // Database Instance
        this.dbInstance = new DatabaseInstance(this, 'PostgresDB', {
            engine: DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_15 }),
            credentials: Credentials.fromGeneratedSecret('postgres', {
                secretName: `${id}-credentials`,
            }),
            vpc,
            vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
            securityGroups: [dbSecurityGroup],
            removalPolicy: RemovalPolicy.DESTROY, // TODO: Replace with Retain
            publiclyAccessible: false,
            multiAz: false,
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            allocatedStorage: 10,
        });

        // Backend Security Group
        const backendSG = new SecurityGroup(this, 'BackendSG', {
            vpc,
            description: 'Security group for backend services',
            allowAllOutbound: true,
        });

        // Allow backend -> DB access
        dbSecurityGroup.addIngressRule(
            backendSG, 
            Port.tcp(5432), 
            'Allow backend to access PostgreSQL'
        );

        // Allow HTTP/HTTPS access if needed
        backendSG.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(80),
            'Allow HTTP traffic'
        );
        backendSG.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(443),
            'Allow HTTPS traffic'
        );

        // Allow SSH Connections
        backendSG.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(22),
            'Allow SSH access from my IP'
        )

        // User data script
        const rawScript = fs.readFileSync(
            path.join(__dirname, '..', 'lib', 'user-data', 'user-data.sh'),
            'utf8'
        );
        
        const userDataScript = rawScript
            .replace(/__DB_SECRET_ARN__/g, this.dbInstance.secret?.secretArn ?? '')
            .replace(/__DB_ENDPOINT__/g, this.dbInstance.dbInstanceEndpointAddress);
        
        const userData = UserData.forLinux();
        userData.addCommands(userDataScript);

        // IAM Role for the EC2 instance
        const ec2Role = new Role(this, 'BackendEC2Role', {
            assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
        });

        // Attach the AWS managed policy for Secrets Manager read access
        ec2Role.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite')
        );

        // Create KeyPair from existing AWS keypair
        const myKey = KeyPair.fromKeyPairName(this, 'ExistingKey', config.ec2KeyPairName);

        // EC2 Instance
        this.backendInstance = new Instance(this, 'BackendInstance', {
            vpc,
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            machineImage: MachineImage.genericLinux({
                'ap-southeast-2': config.ubuntuAmi,
            }),
            securityGroup: backendSG,
            vpcSubnets: {
                subnetType: SubnetType.PUBLIC 
            },
            keyPair: myKey,
            userData,
            role: ec2Role,
        });

        // Grant read access to the database secret
        this.dbInstance.secret?.grantRead(this.backendInstance);
        this.backendInstance.addUserData(
            `export DB_SECRET_ARN=${this.dbInstance.secret?.secretArn}`,
            `export DB_ENDPOINT=${this.dbInstance.dbInstanceEndpointAddress}`
        );

        // Outputs
        new CfnOutput(this, 'RDS-Endpoint', {
            value: this.dbInstance.dbInstanceEndpointAddress,
            description: 'PostgreSQL RDS endpoint',
        });

        new CfnOutput(this, 'DB-Secret-Name', {
            value: this.dbInstance.secret?.secretName ?? 'Unknown',
            description: 'Name of the secret in Secrets Manager',
        });

        new CfnOutput(this, 'EC2-Public-IP', {
            value: this.backendInstance.instancePublicIp,
            description: 'Public IP address of EC2 instance',
        });
    }
}