import { Construct } from 'constructs';
import { AwsStackBase } from './stackbase';

export class EcsClusterStack extends AwsStackBase {
    public cluster: EcsCluster
    constructor(scope: Construct, id: string, props: BaseStackProps) {
        super(scope, `${props.name}-${id}`, {
            name: `${props.project}`,
            project: `${props.project}`,
            region: `${props.region}`
        })
         this.cluster = new EcsCluster(this, `${props.name}-ecs-cluster`, {
            name: `${props.project}-cluster`
        });
    }
}
