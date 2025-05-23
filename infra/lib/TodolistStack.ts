//full-stack demo
//GET /todos/{id} => API Gateway(RestApi) => Proxy Integration REST API
//Lambda function

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";

export class TodolistStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //IAM role
    const todostableiamrole = new iam.Role(this, "todoslistiamlogicalid", {
      roleName: "todolistlambdarole",
      description: "role for lambda service to access dynamoDB",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"), //允许lambda函数访问这些资源
    });

    //add Managed Policy (Lambda 拥有了对所有 S3 bucket 的完整访问权限）
    todostableiamrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess") //allow to access DynamoDB
    );
    todostableiamrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess") //allow to access Cloudwatch, 出错时可以查看错误栈
    );

    //create Lambda function
    const todosLambda = new lambda.Function(this, "TodoListHandler", {
      functionName: "TodosLambda",
      handler: "lambda_todolist.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset("../services/"),
      role: todostableiamrole,
    });

    //create API Gateway (RestApi)
    const todolistrestapi = new apigateway.RestApi(this, "TodosApi", {
      restApiName: "TodosAPI",
      // defaultCorsPreflightOptions: {
      //   allowOrigins: apigateway.Cors.ALL_ORIGINS,
      //   allowMethods: apigateway.Cors.ALL_METHODS,
      // },

      // defaultCorsPreflightOptions: {
      //   allowOrigins: ['https://frontend.netlify.app'],
      //   allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      //   allowHeaders: ['Content-Type'],
      // }
    });

    const apiKey = todolistrestapi.addApiKey("TodoApiKey");

    const usagePlan = todolistrestapi.addUsagePlan("TodoUsagePlan", {
      name: "EmilyTodoUsagePlan",
      apiStages: [
        {
          api: todolistrestapi,
          stage: todolistrestapi.deploymentStage,
        },
      ],
    });

    usagePlan.addApiKey(apiKey);

    const todos = todolistrestapi.root.addResource("todos"); //Authentication Token

    //InvokeFunction(不需要自己手动添加权限), 将lambda:InvokeFunction 加到 Lambda 的 Resource Policy 上
    todos.addMethod("GET", new apigateway.LambdaIntegration(todosLambda), {
      apiKeyRequired: true,
    }); //get所有todo

    todos.addMethod("POST", new apigateway.LambdaIntegration(todosLambda), {
      apiKeyRequired: true,
    }); //post一个todo

    const singleTodo = todos.addResource("{id}");

    singleTodo.addMethod("PUT", new apigateway.LambdaIntegration(todosLambda), {
      apiKeyRequired: true,
    }); //更新或替换

    singleTodo.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(todosLambda),
      {
        apiKeyRequired: true,
      }
    ); //删除

    //dynamodb
    const todolistTable = new dynamodb.Table(this, "todostablelogicalid", {
      tableName: "TodosTable",
      partitionKey: {
        //Cannot change the partition key once the table is created
        name: "task_id", //类似sql中的primary key
        type: dynamodb.AttributeType.NUMBER,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, //NOTICE: only for this demo project. Usually keep tables
    });
  }
}
