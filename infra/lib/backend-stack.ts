import * as fs from 'fs';
import * as path from 'path';

import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
    Instance,
    InstanceType,
    SubnetType,
    SecurityGroup,
    Vpc,
    Peer,
    Port,
    InstanceClass,
    InstanceSize,
    UserData,
    MachineImage,
} from 'aws-cdk-lib/aws-ec2';
import { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

import { config } from '../config/dev';

interface BackendStackProps extends StackProps {
    vpc: Vpc;
    db: DatabaseInstance;
    databaseSG: SecurityGroup;
}

export class BackendStack extends Stack {
    public readonly backendInstance: Instance;
    
    constructor(scope: Construct, id: string, props: BackendStackProps) {
        super(scope, id, props);

        const { vpc, db, databaseSG } = props;

        const ubuntuAmi = MachineImage.genericLinux({
            'ap-southeast-2': config.ubuntuAmi,
        });

        const backendSG = new SecurityGroup(this, 'BackendSG', {
            vpc,
            description: 'Security group for backend services',
            allowAllOutbound: true,
        });

        // Allow backend -> DB access
        databaseSG.addIngressRule(
            backendSG, 
            Port.tcp(5432), 
            'Allow backend to access PostgreSQL'
        );

        // Optional: Allow HTTP/HTTPS access if needed
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

        // User data script
        const userDataScript = fs.readFileSync(
            path.join(__dirname, 'user-data', 'user-data.sh'),
            'utf8'
        );
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

        // EC2 Instance
        this.backendInstance = new Instance(this, 'BackendInstance', {
            vpc,
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            machineImage: ubuntuAmi,
            securityGroup: backendSG,
            vpcSubnets: {
                subnetType: SubnetType.PUBLIC 
            },
            keyName: config.ec2KeyPairName,
            userData,
            role: ec2Role,
        });

        // Grant read access to the database secret
        db.secret?.grantRead(this.backendInstance);
        this.backendInstance.addUserData(
            `export DB_SECRET_ARN=${db.secret?.secretArn}`,
            `export DB_ENDPOINT=${db.dbInstanceEndpointAddress}`
        );
    }
}
