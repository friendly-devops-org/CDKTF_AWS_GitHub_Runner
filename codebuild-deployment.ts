import { App } from 'cdktf';
import { BaseStackProps } from './lib/stacks/stackbase';
import { CodebuildStack, CodebuildConfigs } from './lib/stacks/codebuild-stack';
import { sgStack } from './lib/stacks/securitygroup-stack';

const StackProps: BaseStackProps = {
    name: "runner",
    project: "github-group",
    region: "us-east-2"
}

const app = new App();
const sGroup = new sgStack(app, "sg-stack", StackProps);

const codebuildConfig: CodebuildConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    securityGroup: sGroup.sg.id,
}

new CodebuildStack(app, "codebuild-stack", codebuildConfig);

// To deploy using Terraform Cloud comment out the above line
// And uncomment the below block of lines

/*const stack = new EcsServiceStack(app, "ecs-service-stack", EcsConfig);
new RemoteBackend(stack, {
  hostname: "app.terraform.io",
  organization: process.env.CDKTF_ECS_TFC_ORGANIZATION || "",
  workspaces: {
    name: "ecs-microservices-cdktf"
  }
}); */

app.synth();
