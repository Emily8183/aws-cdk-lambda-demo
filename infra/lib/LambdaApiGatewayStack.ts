//demo lambda API gateway

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class LambdaApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 创建 Lambda 函数，this 指当前 Stack，也就是 LambdaApiGatewayStack 的实例。
    const myLambda = new lambda.Function(this, "MyLambdaFunction", {
      handler: "lambda_function.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset("../services/"),
      functionName: "demolambdagateway",
    });

    // 创建 API Gateway REST API
    const api = new apigateway.RestApi(this, "MyApiGateway", {
      restApiName: "Demo API",
    });

    // 将 Lambda 与 API Gateway 集成
    const lambdaIntegration = new apigateway.LambdaIntegration(myLambda);

    // 定义资源路径和方法（比如 GET /hello）
    // .addResource("greeting"): 表示在根路径下添加一个名为 "greeting" 的路径，最终路径就是 https://your-api-url/greeting
    api.root.addResource("greeting").addMethod("GET", lambdaIntegration);

    // 输出 API URL
    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url, // 类似 https://xxxxx.execute-api.region.amazonaws.com/prod/
    });
  }
}
