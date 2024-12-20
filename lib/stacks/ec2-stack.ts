import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { Instance, InstanceLaunchTemplate } from '@cdktf/provider-aws/lib/instance';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { IamInstanceProfile } from '@cdktf/provider-aws/lib/iam-instance-profile';


export interface InstanceConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    launchTemplate: InstanceLaunchTemplate,
}

export class InstanceStack extends AwsStackBase {
    constructor(scope: Construct, id: string, props: InstanceConfigs) {
        super(scope,`${props.name}-${id}` , {
            name: props.name,
            project: props.project,
            region: props.region,
        })

        const ec2Role = new IamRole(this, `${props.name}-ec2-role`, {
          name: `${props.name}-ec2-role`,
          inlinePolicy: [
            {
              name: "deploy-ec2",
              policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: [ "ec2:*", "kms:*"],
                    Resource: "*",
                  },
                ],
              }),
            },
          ],
          assumeRolePolicy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Sid: "",
                Principal: {
                  Service: "ecs.amazonaws.com",
                },
              },
              {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Sid: "",
                Principal: {
                  Service: "ec2.amazonaws.com",
                },
              },
            ],
          }),
        });

        const instanceProfile = new IamInstanceProfile(this, `${props.name}-instance-profile`, {
            name: ec2Role.name,
            role: ec2Role.name,
        })

        new Instance(this,`${props.name}-instance`, {
            launchTemplate: props.launchTemplate,
            iamInstanceProfile: instanceProfile.name,
            tags: {
                Name: `${props.name}-${props.project}-${props.region}-instance`
            }

        })
    }
}
