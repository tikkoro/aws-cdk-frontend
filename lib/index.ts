import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { AppRunnerStack } from "./appRunnerStack";
import { CodeFamilyStack } from "./codeFamilyStack";
import { EcrStack } from "./ecrStack";

// Context
export type envType = {
  stage: "dev" | "prod";
  ecrRepositoryName: string;
  codeRepositoryName: string;
  branch: "dev" | "prod";
};

// Parent Stack
export class RootStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Read Context
    const envKey = this.node.tryGetContext("env");
    if (envKey == undefined) {
      throw new Error(`cdk deploy -c env=dev or env=prod`);
    }
    const envValue: envType = this.node.tryGetContext(envKey);

    new EcrStack(this, `EcrStack-${envValue.stage}`, envValue);
    new CodeFamilyStack(this, `CodeFamilyStack-${envValue.stage}`, envValue);
    new AppRunnerStack(this, `AppRunnerStack-${envValue.stage}`, envValue);
  }
}
