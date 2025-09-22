import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dotenv from 'dotenv';

export class CodepipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ---- Lambda 定义 ----
    const lambdaFunction = new lambda.Function(this, 'MyLambda', {
      runtime: lambda.Runtime.JAVA_11,
      handler: 'com.example.HelloLambda::handleRequest', // Java handler 全类名
      code: lambda.Code.fromAsset('../../java-lambda-demo/target/java-lambda-demo-1.0-SNAPSHOT.jar'), // java can‘t use fromInline
    });

    // ---- Pipeline Artifacts ----
    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    // CodeBuild: 编译Java Lambda，直接在CDK里内联buildSpec
    const buildProject = new codebuild.PipelineProject(this, 'BuildLambda', {
      environment: { buildImage: codebuild.LinuxBuildImage.STANDARD_5_0 },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              'cd java-lambda-demo', //切到Maven项目根目录
              'mvn clean package -DskipTests',
              'mkdir -p ../build',
              'cp target/*.jar ../build/function.jar'
            ]
          }
        },
        artifacts: {
          'files': ['build/function.jar']
        }
      })
    });

    // ---- Pipeline ----
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'JavaLambdaPipeline0921'
    });

    // Source Stage
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.CodeStarConnectionsSourceAction({
          actionName: 'Checkout_Lambda',
          owner: 'Emily8183',
          repo: 'java-lambda-demo',
          branch: 'main',
          connectionArn: process.env.CONNECTION_ARN,
          output: sourceOutput
        })
      ]
    });

    // Build Stage
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Build_Lambda',
          project: buildProject,
          input: sourceOutput,
          outputs: [buildOutput]
        })
      ]
    });

    // Deploy Stage
    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new codepipeline_actions.LambdaDeployAction({
          actionName: 'Deploy_Lambda',
          input: buildOutput,
          lambda: lambdaFunction
        })
      ]
    });
  }
}
