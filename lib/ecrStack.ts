import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { envType } from ".";

// Stack for ECR
export class EcrStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    envValue: envType,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Create ECR repository
    const ecrRepository = new ecr.Repository(this, "ecr-image-repository", {
      repositoryName: envValue.ecrRepositoryName,
      imageScanOnPush: false,
      lifecycleRules: [
        {
          rulePriority: 1,
          description: "Delete old image",
          maxImageCount: 2,
          tagStatus: ecr.TagStatus.ANY,
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Register ssm paramator store
    new ssm.StringParameter(this, `EcrRepositoryUri-${envValue.stage}`, {
      parameterName: `EcrRepositoryUri-${envValue.stage}`,
      stringValue: ecrRepository.repositoryUri,
    });
    new ssm.StringParameter(this, `EcrRepositoryName-${envValue.stage}`, {
      parameterName: `EcrRepositoryName-${envValue.stage}`,
      stringValue: ecrRepository.repositoryName,
    });
  }
}
