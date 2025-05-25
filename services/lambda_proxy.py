import boto3
import urllib.request
import urllib.parse
import json
import traceback

ssm = boto3.client("ssm")

def lambda_handler(event, context):
    try:
        #step1: 从SSM拿URL和API Key
        api_url = ssm.get_parameter(Name="/todolist/api/url", WithDecryption=True)["Parameter"]["Value"]
        api_key = ssm.get_parameter(Name="/todolist/api/key", WithDecryption=True)["Parameter"]["Value"]

        #step2: 拼接路径和查询参数
        path = event["path"]
        query = event.get("queryStringParameters") or {}
        url = f"{api_url}{path}"
        if query:
            url += "?" + urllib.parse.urlencode(query)

        #Step3: 获取请求方法和 body
        method = event["httpMethod"]
        headers = {
            "x-api-key": api_key,
            "Content-Type": event["headers"].get("Content-Type", "application/json"),
        }

        body = event.get("body")
        if body and event.get("isBase64Encoded"):
            import base64
            body = base64.b64decode(body)

        #Step4: 构建 request 对象
        req = urllib.request.Request(url, data=body.encode() if isinstance(body, str) else body, headers=headers, method=method)

        #Step5: 调用真实 API
        with urllib.request.urlopen(req) as res:
            return {
                "statusCode": res.getcode(),
                "body": res.read().decode("utf-8"),
                "headers": {
                    "Content-Type": res.headers.get("Content-Type", "application/json"),
                    "Access-Control-Allow-Origin": "https://react-mini-todolist.netlify.app",
                    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            }

    except Exception as e:
        return {
            "statusCode": 502,
            "body": json.dumps({
                "error": "Proxy failed",
                "exception": traceback.format_exc()
            }),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
