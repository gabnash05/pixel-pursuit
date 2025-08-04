import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { DatabaseStack } from '../lib/database-stack';
import { BackendStack } from '../lib/backend-stack';
import { CfnOutput } from 'aws-cdk-lib';

const app = new cdk.App();

const networkStack = new NetworkStack(app, 'PixelPursuit-Network');

const databaseStack = new DatabaseStack(app, 'PixelPursuit-Database', {
    vpc: networkStack.vpc,
});

const backendStack = new BackendStack(app, 'PixelPursuit-Backend', {
    vpc: networkStack.vpc,
    db: databaseStack.dbInstance,
    databaseSG: databaseStack.dbSecurityGroup,
});

new CfnOutput(app, 'RDS-Endpoint', {
    value: databaseStack.dbInstance.dbInstanceEndpointAddress,
    description: 'PostgreSQL RDS endpoint',
});

new CfnOutput(app, 'EC2-Public-IP', {
    value: backendStack.backendInstance.instancePublicIp,
    description: 'Public IP address of EC2 instance',
});

new CfnOutput(app, 'DB-Secret-Name', {
    value: databaseStack.dbInstance.secret?.secretName ?? 'Unknown',
    description: 'Name of the secret in Secrets Manager',
}); 