import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class LambdaStack extends cdk.Stack {
  public readonly lambdaFunction: lambda.IFunction;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 创建 Java Lambda
    this.lambdaFunction = new lambda.Function(this, 'MyJavaLambda', {
      runtime: lambda.Runtime.JAVA_11,
      handler: 'example.Handler', // Java Handler 全类名
      code: lambda.Code.fromAsset('lambda/target/lambda.jar'), // 初次部署可以放已经打包好的 jar
    });
  }
}
