//this cdk stack is to run the Lambda written in Java from a separate repo

import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class CdkStackForJavaLambda extends cdk.Stack {
 constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     const lambdaFunction = new lambda.Function(this, 'HelloLambdaInJava', {
          functionName: 'java-lambda-demo-cdk',
          runtime: lambda.Runtime.JAVA_11,
          handler: 'com.example.HelloLambda::handleRequest',
          // .fromAsset() is only for local files and directories
          code: lambda.Code.fromAsset('../../java-lambda-demo/target/java-lambda-demo-1.0-SNAPSHOT.jar'),
          timeout: cdk.Duration.seconds(30),
        });

     new cdk.CfnOutput(this, 'FunctionName', {
      value: lambdaFunction.functionName,
      description: 'Lambda Function Name',
     });

    new cdk.CfnOutput(this, 'FunctionArn', {
       value: lambdaFunction.functionArn, //output an ARN -globally unique identifier
       description: 'Lambda Function ARN',
    });
 }

}