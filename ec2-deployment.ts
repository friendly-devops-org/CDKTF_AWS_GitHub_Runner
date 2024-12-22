import { App } from 'cdktf';
import { BaseStackProps } from './lib/stacks/stackbase';
import { InstanceStack, InstanceConfigs } from './lib/stacks/ec2-stack';
import { LaunchTemplateStack, LaunchTemplateConfigs } from './lib/stacks/launchtemplate-stack';
import { sgStack } from './lib/stacks/securitygroup-stack';
import { SsmStack, paramStoreConfigs } from './lib/stacks/ssm-stack';

const StackProps: BaseStackProps = {
    name: "runner1",
    project: "github-ec2-group",
    region: "us-east-2"
}

function aFile(key: string){
    const fileS = require('fs');
    fileS.writeFileSync('./scripts/cluster.sh',"#!/bin/bash\n");
    fileS.appendFileSync('./scripts/cluster.sh',"sudo yum install -y tar curl jq\n");
    fileS.appendFileSync('./scripts/cluster.sh',"sudo yum install -y dotnet-sdk-6.0\n");
    fileS.appendFileSync('./scripts/cluster.sh',"export RUNNER_ALLOW_RUNASROOT=true\n");
    fileS.appendFileSync('./scripts/cluster.sh',"mkdir /home/ec2-user/actions-runner && cd /home/ec2-user/actions-runner\n");
    fileS.appendFileSync('./scripts/cluster.sh',"curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz\n");
    fileS.appendFileSync('./scripts/cluster.sh',"tar xzf ./actions-runner-linux-x64-2.321.0.tar.gz\n");
    fileS.appendFileSync('./scripts/cluster.sh',"chown -R ec2-user:ec2-user ../actions-runner\n");
    fileS.appendFileSync('./scripts/cluster.sh',"runnername='AWS-EC2'\n");
    fileS.appendFileSync('./scripts/cluster.sh',"export PAT=$(aws ssm get-parameter --name '" + key + "' --with-decryption --query Parameter.Value --output text)\n");
    fileS.appendFileSync('./scripts/cluster.sh',"export TOKEN=$(curl -L   -X POST   -H \"Accept: application/vnd.github+json\"   -H \"Authorization: Bearer $PAT\"   -H \"X-GitHub-Api-Version: 2022-11-28\"   https://api.github.com/orgs/" + `${process.env.REPO_OWNER}` + "/actions/runners/registration-token | jq -r .token)\n");
    // ###### To deploy to personal account comment out upper line and uncomment the lower line ####
    //fileS.appendFileSync('./scripts/cluster.sh',"export TOKEN=$(curl -L   -X POST   -H \"Accept: application/vnd.github+json\"   -H \"Authorization: Bearer $ACESS_TOKEN\"   -H \"X-GitHub-Api-Version: 2022-11-28\"   https://api.github.com/" + `${process.env.REPO_OWNER}` + "/" + `${process.env.REPOSITORY}` + "/actions/runners/registration-token | jq -r .token)\n");
    fileS.appendFileSync('./scripts/cluster.sh',"./config.sh --url https://github.com/" + `${process.env.REPO_OWNER}` + " --runnergroup Default --token $TOKEN\n");
    // ###### To deploy to personal account comment out upper line and uncomment the lower line ####
    //fileS.appendFileSync('./scripts/cluster.sh',"./config.sh --url https://github.com/" + `${process.env.REPO_OWNER}` + "/" + `${process.env.REPOSITORY}` + " --runnergroup Default --token $TOKEN\n");
    fileS.appendFileSync('./scripts/cluster.sh',"./run.sh");
}

const app = new App();
const sGroup = new sgStack(app, "sg-ec2-stack", StackProps);

const token = `/${StackProps.name}/${StackProps.project}/gh-token`;
aFile(token);

const LTConfig: LaunchTemplateConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    imageId: "ami-0b4624933067d393a",
    instanceType: "t3.micro",
    securityGroupIds: [sGroup.sg.id],
    userData: "./scripts/cluster.sh"
}

const launchTemplate = new LaunchTemplateStack(app, "lt-ec2-stack", LTConfig)

const PmsConfig: paramStoreConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    paramName: "gh-token",
    paramValue: `${process.env.GH_TOKEN}`,
}

new SsmStack(app, "gh-token-pm-store", PmsConfig)

const Ec2Config: InstanceConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    launchTemplate: {
        id: launchTemplate.launchTemplate.id
    }
}

new InstanceStack(app, "ec2-stack", Ec2Config);


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
