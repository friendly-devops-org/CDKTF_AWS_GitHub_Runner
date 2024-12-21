import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { SsmParameter } from '@cdktf/provider-aws/lib/ssm-parameter';

export interface paramStoreConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    paramName: string,
    paramValue: string,
}

export class SsmStack extends AwsStackBase {
    constructor(scope: Construct, id: string, props: paramStoreConfigs) {
        super(scope,  `${props.name}-${id}`, {
            name: `${props.name}`,
            project: `${props.project}`,
            region: `${props.region}`,
        })

        new SsmParameter (this, `${props.name}-parameter-store`, {
            name: `${props.name}/${props.project}/${props.paramName}`,
            type: "SecureString",
            value: props.paramValue
        })
    }
}
