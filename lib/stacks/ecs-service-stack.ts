import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { EcsService } from '@cdktf/provider-aws/lib/ecs-service';

export interface EcsServiceConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    cluster: string,
    taskDefinition: string,
    securityGroup: string,
    desiredCount: number,
}

export class EcsServiceStack extends AwsStackBase {
    public ecs: EcsService
    constructor(scope: Construct, id: string, props: EcsServiceConfigs) {
        super(scope,`${props.name}-${id}` , {
            name: props.name,
            project: props.project,
            region: props.region,
        })
        this.ecs = new EcsService(this,`${props.name}-service`, {
            cluster: props.cluster,
            name: `${props.name}-service`,
            taskDefinition: props.taskDefinition,
            desiredCount: props.desiredCount,
            launchType: "FARGATE",
            healthCheckGracePeriodSeconds: 300,
            networkConfiguration: {
                assignPublicIp: true,
                subnets: [`${process.env.SUBNET}`, `${process.env.SUBNET_2}`],
                securityGroups: [props.securityGroup]
            }

        })
    }
}
