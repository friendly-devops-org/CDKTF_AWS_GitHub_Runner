import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { CodebuildProject } from '@cdktf/provider-aws/lib/codebuild-project'
import { CodebuildWebhook } from '@cdktf/provider-aws/lib/codebuild-webhook'
import { CodebuildSourceCredential } from '@cdktf/provider-aws/lib/codebuild-source-credential'

export interface CodebuildConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    securityGroup: string,
}

export class CodebuildStack extends AwsStackBase {
    public credential: CodebuildSourceCredential;
    public webhook: CodebuildWebhook;
    constructor(scope: Construct, id: string, props: CodebuildConfigs) {
        super(scope, `${props.name}-${id}`, {
            name: `${props.project}`,
            project: `${props.project}`,
            region: `${props.region}`
        })
        const codebuildRole = new IamRole(this, `${props.name}-ecs-role`, {

          name: `${props.name}-codebuild-role`,
          inlinePolicy: [
            {
              name: "codebuild",
              policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: ["codebuild:*", "ec2:*", "kms:*", "ecr:*"],
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
                  Service: "codebuild.amazonaws.com",
                },
              },
              {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Sid: "",
                Principal: {
                  Service: "codebuild.amazonaws.com",
                },
              },
            ],
          }),
        });

        const codebuild = new CodebuildProject (this, `${props.name}-codebuild-${props.project}`, {
            name: `${props.name}-${props.project}-codebuild`,
            artifacts: {type: "NO_ARTIFACTS"},
            serviceRole: codebuildRole.arn,
            environment: {
                computeType: "BUILD_GENERAL1_SMALL",
                image: "aws/codebuild/amazonlinux2-x86_64-standard:4.0",
                type: "LINUX_CONTAINER",
            },
            vpcConfig: {
                securityGroupIds: [`${props.securityGroup}`],
                subnets: [`${process.env.SUBNET}`, `${process.env.SUBNET_2}`],
                vpcId: `${process.env.VPC_ID}`
            },
            source: {
                type: "GITHUB",
                location: "CODEBUILD_DEFAULT_WEBHOOK_SOURCE_LOCATION"

            }

        });

        this.webhook = new CodebuildWebhook(this, `${props.name}-${props.project}-webhook`, {
            projectName: codebuild.name,
            filterGroup: [
                {
                    filter: [
                        {
                            type: "EVENT",
                            pattern: "WORKFLOW_JOB_QUEUED"
                        }
                    ]
                }
            ],
        });
    }
}
