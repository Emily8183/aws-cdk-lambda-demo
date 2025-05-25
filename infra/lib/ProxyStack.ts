import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";

export class ProxyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //iam role
    const proxyLambdaRole = new iam.Role(this, "ProxyLambdaRole", {
      roleName: "proxylambdarole",
      description: "Role for proxy lambda to access SSM",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    proxyLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    // Add SSM read permission
    proxyLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/todolist/api/*`,
        ],
      })
    );

    //lambda function
    const proxyLambda = new lambda.Function(this, "ProxyLambda", {
      functionName: "ProxyLambda",
      handler: "lambda_proxy.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset("../services/"),
      role: proxyLambdaRole,
    });

    // proxy API Gateway
    const proxyrestApi = new apigateway.RestApi(this, "ProxyApi", {
      restApiName: "ProxyAPI",
      description:
        "API Gateway that proxies requests to real API with API Key.",
      defaultCorsPreflightOptions: {
        allowOrigins: ["https://react-mini-todolist.netlify.app/"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type"],
      },
    });

    // Catch-all proxy resource: /{proxy+}
    const proxyResource = proxyrestApi.root.addResource("{proxy+}");

    proxyResource.addMethod(
      "ANY",
      new apigateway.LambdaIntegration(proxyLambda),
      {
        apiKeyRequired: false,
      }
    );
  }
}
