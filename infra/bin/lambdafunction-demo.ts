#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { LambdafunctionDemoStack } from "../lib/LambdafunctionDemoStack";
import { LambdaApiGatewayStack } from "../lib/LambdaApiGatewayStack";
import { S3Stack } from "../lib/S3Stack";

const app = new cdk.App();
// launch a lambda function which can be visited by URL
// new LambdafunctionDemoStack(app, "InfraStack", {
// });

// launch a lambda function with API gateway
// new LambdaApiGatewayStack(app, "InfraStack", {}); //app 是一个 cdk.App 实例，它代表的是 整个 CDK 应用程序

new S3Stack(app, "Bankingstatusapp", {});
