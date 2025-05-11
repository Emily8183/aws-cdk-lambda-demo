//demo lambda function URL

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class LambdafunctionDemoStack extends cdk.Stack {
  //构造函数，在此定义如何创建栈
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // lambda function
    const demolambda = new lambda.Function(this, "demologicalid", {
      handler: "lambda_function.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset("../services/"),
      functionName: "democdklambda",
    });

    //create a Function URL
    const fnUrl = demolambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    //output URL
    new cdk.CfnOutput(this, "FunctionUrl", {
      value: fnUrl.url,
    });
  }
}
