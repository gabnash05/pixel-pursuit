import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
    DatabaseInstance,
    DatabaseInstanceEngine,
    PostgresEngineVersion,
    Credentials,
} from 'aws-cdk-lib/aws-rds';
import { Vpc, SecurityGroup, Peer, Port, SubnetType, InstanceType, InstanceClass, InstanceSize } from 'aws-cdk-lib/aws-ec2';

interface DatabaseStackProps extends StackProps {
    vpc: Vpc;
}

export class DatabaseStack extends Stack {
    public readonly dbInstance: DatabaseInstance;
    public readonly dbSecurityGroup: SecurityGroup;

    constructor(scope: Construct, id: string, props: DatabaseStackProps) {
        super(scope, id, props);

        const { vpc } = props;

        this.dbSecurityGroup = new SecurityGroup(this, 'DbSecurityGroup', {
            vpc,
            description: 'Security group for PostgreSQL database',
            allowAllOutbound: true,
        });

        this.dbSecurityGroup.addIngressRule(
            this.dbSecurityGroup, 
            Port.tcp(5432), 
            'Allow self'
        );

        this.dbInstance = new DatabaseInstance(this, 'PostgresDB', {
            engine: DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_15 }),
            credentials: Credentials.fromGeneratedSecret('postgres', {
                secretName: `${id}-credentials`,
            }),
            vpc,
            vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
            securityGroups: [this.dbSecurityGroup],
            removalPolicy: RemovalPolicy.DESTROY, // TODO: Change to RETAIN
            publiclyAccessible: false,
            multiAz: false,
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            allocatedStorage: 10,
        });
    }
}
