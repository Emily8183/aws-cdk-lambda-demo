import json
import boto3

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
    # path_params = event.get("pathParameters") or {} # “or {}” 容错
    # todo_id = path_params.get("id")
    # body = json.loads(event.get("body", "{}"))

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
    
