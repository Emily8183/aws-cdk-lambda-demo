import json
import boto3
client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    response = client.get_object(
        Bucket='retailfeeds3bucket514',
        Key='cdktestfile.json',
)

# convert data into a dict so we can insert it into a table
# convert from streaming data to byte
    json_data = response['Body'].read()
    #print(json_data)
    #print(type(json_data))
    #convert data from byte to string
    data_string = json_data.decode('UTF-8')
    #print(data_string)
    #print(type(data_string))
    # convert from json string to dictionary
    data_dict =json.loads(data_string)
    # print(data_dict)
    # print(type(data_dict))
    
    #insert data to dynamodb
    table = dynamodb.Table('retaildynamodbtable')
    table.put_item(Item=data_dict)