//full-stack demo
//GET /todos/{id} => API Gateway(RestApi) => Proxy Integration REST API
//Lambda function

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class TodolistStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //create Lambda function
    const todosLambda = new lambda.Function(this, "TodoListHandler", {
      functionName: "TodosLambda",
      handler: "lambda_todolist.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset("../services/"),
    });

    //create API Gateway (RestApi)
    const todolistrestapi = new apigateway.RestApi(this, "TodosApi", {
      restApiName: "TodosAPI",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },

      // defaultCorsPreflightOptions: {
      //   allowOrigins: ['https://frontend.netlify.app'],
      //   allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      //   allowHeaders: ['Content-Type'],
      // }
    });

    const todos = todolistrestapi.root.addResource("todos");
    todos.addMethod("GET", new apigateway.LambdaIntegration(todosLambda)); //get所有todo
    todos.addMethod("POST", new apigateway.LambdaIntegration(todosLambda)); //post一个todo

    const singleTodo = todos.addResource("{id}");
    singleTodo.addMethod("PUT", new apigateway.LambdaIntegration(todosLambda)); //更新或替换
    singleTodo.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(todosLambda)
    ); //删除
  }
}
