import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { 
    Vpc, 
    SubnetType, 
    IpAddresses,
} from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends Stack {
    public readonly vpc: Vpc;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.vpc = new Vpc(this, 'pixel-pursuit-vpc', {
            maxAzs: 2,
            ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'public',
                    subnetType: SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'private',
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                },
            ],
        });
    }
}
