import json
def lambda_handler(event, context):
   
    print("Emily is testing")
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }