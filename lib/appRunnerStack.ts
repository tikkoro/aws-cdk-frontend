import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apprunner from "aws-cdk-lib/aws-apprunner";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { envType } from ".";

// Stack for AppRunner
export class AppRunnerStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    envValue: envType,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const ecrAccessRole = new iam.Role(this, "EcrAccessRole", {
      roleName: "AppRunnerECRAccessRole",
      assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
      description: "IAM role used by AppRunner",
    });

    ecrAccessRole.addManagedPolicy({
      managedPolicyArn:
        "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess",
    });

    const ecrRepositoryUri = ssm.StringParameter.valueForStringParameter(
      this,
      `EcrRepositoryUri-${envValue.stage}`
    );

    // L1 constructs
    new apprunner.CfnService(this, "AppRunnerExampleService", {
      serviceName: "NextjsSampleApp",
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: ecrAccessRole.roleArn,
        },
        imageRepository: {
          imageRepositoryType: "ECR",
          imageIdentifier: `${ecrRepositoryUri}:latest`,
          imageConfiguration: {
            port: "3000",
            runtimeEnvironmentVariables: [
              { name: "HOSTNAME", value: "0.0.0.0" },
            ],
          },
        },
        autoDeploymentsEnabled: true,
      },
      instanceConfiguration: {
        cpu: "0.25 vCPU",
        memory: "0.5 GB",
      },
    });
  }
}
