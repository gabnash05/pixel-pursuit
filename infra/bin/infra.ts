import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { BackendStack } from '../lib/backend-stack';

const app = new cdk.App();

const networkStack = new NetworkStack(app, 'PixelPursuit-Network');

const backendStack = new BackendStack(app, 'PixelPursuit-Backend', {
    vpc: networkStack.vpc,
});