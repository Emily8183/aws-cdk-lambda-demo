import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";

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
  }
}
