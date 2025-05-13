#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { LambdafunctionDemoStack } from "../lib/LambdafunctionDemoStack";
import { LambdaApiGatewayStack } from "../lib/LambdaApiGatewayStack";
import { S3Stack } from "../lib/S3Stack";
import { S3triggerlambdawritesdb } from "../lib/S3triggerlambdawritesdb";

const app = new cdk.App();
// Sample1: launch a lambda function which can be visited by URL
// new LambdafunctionDemoStack(app, "InfraStack", {
// });

// Sample2: launch a lambda function with API gateway
// new LambdaApiGatewayStack(app, "InfraStack", {}); //app 是一个 cdk.App 实例，它代表的是 整个 CDK 应用程序

// Sample3: demo using API gateway to invoke a lambda function that reads data from S3
// new S3Stack(app, "Bankingstatusapp", {});

// Sample4: demo using s3 invoke a lambda function then writes in DynamoDB
new S3triggerlambdawritesdb(app, "RetailInfraStack", {});
