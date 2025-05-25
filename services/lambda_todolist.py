import json
import boto3
import time  # 用来生成Task_id，模拟时间戳
from boto3.dynamodb.conditions import Attr #not as efficient as Query


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("TodosTable") #直接引用

def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json", #告诉浏览器返回的是.json
            "Access-Control-Allow-Origin": "http://localhost:5173", #lambda函数中返回的headers
            "Access-Control-Allow-Headers": "Content-Type,x-api-key",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS"
        },
        "body": json.dumps(body, default=str) # default=str: convert the Decimal type
    }

def lambda_handler(event, context):

    # smoke test
    print("Received event:", json.dumps(event, indent=2)) #event对象格式化

    # return {
    #     "statusCode": 200,
    #     "headers": {
    #         "Content-Type": "application/json"
    #     },
    #     "body": json.dumps({
    #         "message": "Hello from Python Lambda!"
    #     })
    # }

    method = event["httpMethod"]

    #OPTIONS:
    if method == 'OPTIONS':
        return build_response(200, "CORS preflight passed")


    # GET: passed test in postman
    if method == 'GET':
        # return "123"
        try:
            response = table.scan( #TODO: use query() instead of FilterExpression
                FilterExpression=Attr("status").eq(False) #scan first, then filter
            ) 
            items = response.get("Items",[]) #if nothing received, return []
            return build_response(200, items)
        except Exception as e:
            print("Error scanning table:", str(e))
            return build_response(500, {"error": str(e)})

    #先从http接收到的json字符串，通过json.loads转成python dict
    body = json.loads(event.get('body', '{}'))       

    if method == 'POST':
        try:
            todoitem = {
                "task_id": int(time.time()), #以后应该创建成string, 用UUID
                "task": body.get("task", ""),
                "status": body.get("status", False)
            }

            table.put_item(Item=todoitem)

            return build_response(201, todoitem)
        
        except Exception as e:
            return build_response(500, {"error": str(e)})
        
    if method == "PUT":
        task_id = int(body.get("task_id")) #Integer type
        new_task = body.get("task")
        new_status = body.get("status")

        # if not task_id:
        #     return {"statusCode": 400, "body": "task_id is required"}

        table.update_item(
            Key={"task_id": task_id},
            UpdateExpression="SET task = :t, #completed = :s", # set alias by using #completed, to represent "status" in the DynamoDB
            ExpressionAttributeNames={
                "#completed": "status"
            },
            ExpressionAttributeValues={
                ":t": new_task,
                ":s": new_status
            }
        )

        #double check the updated task, if no issues, can send back to the frontend
        updated_item = table.get_item(Key={"task_id": task_id}).get('Item')

        return build_response(200,updated_item)

    if method == "DELETE":
        task_id = int(event["pathParameters"]["id"]) #note the task_id is in integer type here

        # if not task_id:
        #     return {
        #         "statusCode": 400,
        #         "body": "Missing task_id"
        #     }

        table.delete_item(Key={"task_id": task_id})

        return build_response(200, {"message": "Deleted"})

    return build_response(400, {"error": "Unsupported method"})

