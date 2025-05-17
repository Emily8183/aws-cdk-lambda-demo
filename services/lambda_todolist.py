import json
import boto3
import time  # 用来生成Task_id，模拟时间戳

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("TodosTable") #直接引用


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

    # GET: passed test in postman
    if method == 'GET':
        try:
            response = table.scan() # 对整个TodoTable做一次全表扫描（Scan），返回所有的 todo 项目
            items = response.get("Items",[]) #if nothing received, return []
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"}, #告诉浏览器返回的是.json
                "body": json.dumps(items, default=str)
            }
        except Exception as e:
            print("Error scanning table:", str(e))

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

            return {
                "statusCode": 201,
                "headers": { "Content-Type": "application/json" },
                "body": json.dumps(todoitem)
            }

        except Exception as e:
            return {
                "statusCode": 500,
                "body": json.dumps({ "error": str(e) })
            }
        
    if method == "PUT":
        task_id = body.get("task_id")
        new_task = body.get("task")
        new_status = body.get("status")

        # if not task_id:
        #     return {"statusCode": 400, "body": "task_id is required"}

        table.update_item(
            Key={"task_id": task_id},
            UpdateExpression="SET task = :t, #completed = :s",
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

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(updated_item)
        }


    return {
        "statusCode": 400,
        "body": "Unsupported method"
    }

    

    
    
