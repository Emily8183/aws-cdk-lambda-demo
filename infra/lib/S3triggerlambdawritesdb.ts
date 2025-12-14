//demo using s3 invoke a lambda function then writes in DynamoDB

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class S3triggerlambdawritesdb extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //IAM role (为lambda创建)
    const retailfeediamrole = new iam.Role(this, "retailiamlogicalid", {
      roleName: "inventoryfeedlambdarole",
      description: "role for lambda service to access both s3 and dynamoDB",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"), //允许lambda函数访问这些资源
    });

    //add Managed Policy (Lambda 拥有了对所有 S3 bucket 的完整访问权限）
    retailfeediamrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess") //allow to access S3
    );
    retailfeediamrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess") //allow to access DynamoDB
    );
    retailfeediamrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess") //allow to access Cloudwatch
    );

    //lambda function
    const retaillambda = new lambda.Function(this, "retaillambdalogicalid", {
      handler: "lambda_sample3.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset("../services/"),
      role: retailfeediamrole,
      functionName: "demos3triggerlambdawritesdb",
    });

    // stackA.node.addDependency(stackB) method
    retaillambda.node.addDependency(retailfeediamrole); //dependency of the lambda function on the IAM role, unnecessary here!

    //s3bucket
    const retails3bucket = new s3.Bucket(this, "retailbucketlogicalid", {
      bucketName: "retailfeeds3bucket514",
    });

    // //s3 event notification (any updates in S3 will invoke lambda function)
    retails3bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(retaillambda)
    );

    //dynamodb
    const retaildynamodb = new dynamodb.Table(this, "dynamodblogicalid", {
      tableName: "retaildynamodbtable",
      partitionKey: {
        name: "customername",
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}
