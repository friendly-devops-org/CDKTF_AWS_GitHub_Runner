import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { Instance, InstanceLaunchTemplate } from '@cdktf/provider-aws/lib/instance';


export interface InstanceConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    launchTemplate: InstanceLaunchTemplate,
}

export class InstanceStack extends AwsStackBase {
    public instance: Instance;
    constructor(scope: Construct, id: string, props: EcsServiceConfigs) {
        super(scope,`${props.name}-${id}` , {
            name: props.name,
            project: props.project,
            region: props.region,
        })
        this.instance = new Instance(this,`${props.name}-instance`, {
            launchTemplate: props.launchTemplate,
            tags: {
                Name: `${props.name}-${props.project}-${props.region}-instance`
            }

        })
    }
}
