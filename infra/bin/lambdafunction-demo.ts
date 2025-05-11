#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { LambdafunctionDemoStack } from "../lib/LambdafunctionDemoStack";
import { LambdaApiGatewayStack } from "../lib/LambdaApiGatewayStack";

const app = new cdk.App();
// new LambdafunctionDemoStack(app, "InfraStack", {

// });

new LambdaApiGatewayStack(app, "InfraStack", {}); //app 是一个 cdk.App 实例，它代表的是 整个 CDK 应用程序
