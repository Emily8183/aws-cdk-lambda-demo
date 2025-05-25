# Intro

This repository contains a collection of small AWS CDK demos showcasing different ways to integrate AWS Lambda with other AWS services, including API Gateway, Lambda Function URLs, S3, and DynamoDB.

Each demo is implemented using the AWS CDK in TypeScript, and the Lambda functions are written in Python.

---

## Project Structure

### 1. API Gateway + Lambda Integration

**Stack:** `LambdaApiGatewayStack`  
**Lambda:** `lambda_function`

This demo shows how to create a REST API using API Gateway and integrate it with a Lambda function. You will get a basic API endpoint returning dynamic content.

---

### 2. Lambda Function URL Demo

**Stack:** `LambdafunctionDemoStack`  
**Lambda:** `lambda_function`

This demo shows how to enable **Lambda Function URLs**, which allow your Lambda function to be invoked directly via HTTPS without API Gateway. It's ideal for lightweight use cases where we don't need the full features of API Gateway (e.g., quick webhooks, internal services).

---

### 3. S3 Access via Lambda

**Stack:** `S3Stack`  
**Lambda:** `lambda_s3handler`

This demo shows how to create S3 and grant a Lambda function access to the S3 bucket. It can be used for our serverless automation that interacts with data stored in S3.

---

### 4. S3 Trigger → Lambda → DynamoDB

**Stack:** `S3triggerlambdawritesdb`  
**Lambda:** `lambda_sample3`

This demo shows how to set up S3 event notifications to trigger a Lambda function, and write the updated data into a DynamoDB table. This is a common pattern for serverless data ingestion pipelines.

---

### 5. Full To-Do List API (CRUD)

**Stack:** `TodolistStack`  
**Lambda:** `lambda_todolist`

This demo shows a complete backend API with **GET**, **POST**, **PUT**, and **DELETE** support. Passed the Postman test. 

Useful as a starter template for serverless applications with CRUD operations.

