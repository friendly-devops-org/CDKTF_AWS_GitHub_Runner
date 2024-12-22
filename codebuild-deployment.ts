import { App } from 'cdktf';
import { BaseStackProps } from './lib/stacks/stackbase';
import { CodebuildStack, CodebuildConfigs } from './lib/stacks/codebuild-stack';

const StackProps: BaseStackProps = {
    name: `${process.env.RESOURCE_NAME}`,
    project: `${process.env.RESOURCE_PROJECT}`,
    region: "us-east-2"
}

const app = new App();

const codebuildConfig: CodebuildConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
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
