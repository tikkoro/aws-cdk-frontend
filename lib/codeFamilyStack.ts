import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { envType } from ".";

// Stack for CodeBuild and CodePipeline
export class CodeFamilyStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    envValue: envType,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const ecrRepositoryName = ssm.StringParameter.valueForStringParameter(
      this,
      `EcrRepositoryName-${envValue.stage}`
    );

    // Create CodeBuild
    const buildProject = new codebuild.PipelineProject(this, `Project`, {
      projectName: "NextjsSampleBuild",
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"),
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
        computeType: codebuild.ComputeType.SMALL,
        // privileged: true,
      },
      environmentVariables: {
        AWS_DEFAULT_REGION: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: this.region,
        },
        AWS_ACCOUNT_ID: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: this.account,
        },
        IMAGE_REPO_NAME: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: ecrRepositoryName,
        },
        IMAGE_TAG: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: "latest",
        },
      },
    });

    // CodeBuild role
    buildProject.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [
          `arn:aws:ecr:${this.region}:${this.account}:repository/${ecrRepositoryName}`,
        ],
        actions: [
          "ecr:CompleteLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:InitiateLayerUpload",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
        ],
      })
    );
    buildProject.addToRolePolicy(
      new iam.PolicyStatement({
        // Using '*' because resource-level permissions are not being applied
        resources: ["*"],
        actions: ["ecr:GetAuthorizationToken"],
      })
    );

    // Get CodeCommit repository information
    const codeRepository = codecommit.Repository.fromRepositoryName(
      this,
      "CodeRepository",
      envValue.codeRepositoryName
    ) as codecommit.Repository;

    const sourceOutput = new codepipeline.Artifact();

    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: "CodeCommit",
      repository: codeRepository,
      branch: envValue.branch,
      output: sourceOutput,
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "CodeBuild",
      project: buildProject,
      input: sourceOutput,
      outputs: [new codepipeline.Artifact()],
    });

    // Create CodePipeline
    new codepipeline.Pipeline(this, "Pipeline", {
      pipelineName: "NextjsSamplePipeline",
      stages: [
        {
          stageName: "Source",
          actions: [sourceAction],
        },
        {
          stageName: "Build",
          actions: [buildAction],
        },
      ],
    });
  }
}
