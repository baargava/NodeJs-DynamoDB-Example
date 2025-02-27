const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1', 
  accessKeyId: '****************************',
  secretAccessKey: '*************************************',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
module.exports = dynamodb;