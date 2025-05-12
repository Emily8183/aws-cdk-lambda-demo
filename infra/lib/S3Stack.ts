import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

export class S3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //s3 bucket
    const balancestatuss3 = new s3.Bucket(this, "s3bucketlogicalid", {
      bucketName: "balancestatus-demo", //保持小写或者中划线
    });
  }
}
