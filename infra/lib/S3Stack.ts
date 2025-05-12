import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class S3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //s3 bucket
    const balancestatuss3 = new s3.Bucket(this, "s3bucketlogicalid", {
      bucketName: "balancestatus-demo", //保持小写或者中划线
    });

    //IAM role (为lambda创建)
    const iambalancestatusrole = new iam.Role(this, "iambalancerole", {
      roleName: "bankingLambdaRole",
      description:
        "role for lambda to access s3 bucket to show banking balance",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    //add Managed Policy (Lambda 拥有了对所有 S3 bucket 的完整访问权限）
    iambalancestatusrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );

    //lambda function
    const bankingLambdafunction = new lambda.Function(
      this,
      "lambdas3logcialid",
      {
        handler: "lambda_s3handler.lambda_handler", //must be a string
        runtime: lambda.Runtime.PYTHON_3_9,
        code: lambda.Code.fromAsset("../services/"), //从本地路径中 打包 Lambda 函数的代码，并上传到 AWS
        role: iambalancestatusrole,
      }
    );
  }
}
