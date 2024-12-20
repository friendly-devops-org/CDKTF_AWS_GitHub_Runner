import { App } from 'cdktf';
import { BaseStackProps } from './lib/stacks/stackbase';
import { taskDefinitionStack } from './lib/stacks/taskdefinitions-stack';
import { InstanceStack, InstanceConfigs } from './lib/stacks/ecs-cluster-stack';
import { LaunchTemplateStack, LaunchTemplateConfigs } from './lib/stacks/launchtemplate-stack';
import { sgStack } from './lib/stacks/securitygroup-stack';

const StackProps: BaseStackProps = {
    name: "runner",
    project: "github-group",
    region: "us-east-2"
}

function aFile(key: string){
    const fileS = require('fs');
    fileS.writeFileSync('./scripts/cluster.sh',"#!/bin/bash\n");
    fileS.appendFileSync('./scripts/cluster.sh',"mkdir actions-runner && cd actions-runner");
    fileS.appendFileSync('./scripts/cluster.sh',"curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz");
    fileS.appendFileSync('./scripts/cluster.sh',"tar xzf ./actions-runner-linux-x64-2.321.0.tar.gz");
    fileS.appendFileSync('./scripts/cluster.sh',"./config.sh --url https://github.com/friendly-devops-org --token " + key);
    fileS.appendFileSync('./scripts/cluster.sh',"./run.sh");
}

const app = new App();
const sGroup = new sgStack(app, "sg-stack", StackProps);

const token = `${process.env.RUNNER_TOKEN}`;
aFile(token);

const LTConfig: LaunchTemplateConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    imageId: "ami-00f453db4525939cf",
    instanceType: "t3.micro",
    iamInstanceProfile: cluster.instanceProfile.name,
    securityGroupIds: [sGroup.sg.id],
    userData: "./scripts/cluster.sh"
}

const launchTemplate = new LaunchTemplateStack(app, "lt-stack", LTConfig)

/*const InstanceConfig: InstanceConfigs {
    launchTemplate: {
        id: launchTemplate.launchTemplate.id
}*/

const Ec2Config: LaunchTemplateConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    launchTemplate: launchTemplate.launchTemplate.id
}

const ec2 = new instanceStack(app, "ec2-stack", Ec2Config);


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
