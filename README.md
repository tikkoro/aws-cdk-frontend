# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Initial

- `bun install`

## Useful commands

- `bun run build` compile typescript to js
- `bun run watch` watch for changes and compile
- `bun run test` perform the jest unit tests
- `cdk deploy -c env=dev` or `cdk deploy -c env=prod` deploy this stack to your default AWS account/region
- `cdk diff -c env=dev` compare deployed stack with current state
- `cdk synth -c env=dev` emits the synthesized CloudFormation template

## Deploy

### Create CodeCommit Repository

- `aws codecommit create-repository --repository-name nextjs-sample-code --repository-description "My sample repository"`
- Push your code dev or prod branch

### Create AWS Resource

- `cdk ls -c env=dev` or `cdk ls -c env=prod`
- `cdk deploy -c env=dev` or `cdk deploy -c env=prod`
