const lambdaNameTemplate = tableLogicalName =>
  `DynamoDBSnapshot${tableLogicalName}`;

const lambdaRoleTemplate = (tableLogicalName, bucketLogicalName) => ({
  Type: 'AWS::IAM::Role',
  Properties: {
    AssumeRolePolicyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            Service: ['lambda.amazonaws.com']
          },
          Action: ['sts:AssumeRole']
        }
      ]
    },
    Path: '/',
    Policies: [
      {
        PolicyName: 'dawson-backup-trigger',
        PolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: ['s3:PutObject'],
              Resource: [{ 'Fn::Sub': `arn:aws:s3:::\${${bucketLogicalName}}/*` }]
            },
            {
              Effect: 'Allow',
              Action: [
                'dynamodb:DescribeStream',
                'dynamodb:GetRecords',
                'dynamodb:GetShardIterator',
                'dynamodb:ListStreams',
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents'
              ],
              Resource: '*' // @TODO dynamodb Stream Arn here
            }
          ]
        }
      }
    ]
  }
});

module.exports = function createDynamodbBackupTrigger (params) {
  const tableLogicalName = params.tableLogicalName;
  const bucketLogicalName = params.bucketLogicalName;
  const streamArn = { 'Fn::GetAtt': [tableLogicalName, 'StreamArn'] };
  const lambdaName = lambdaNameTemplate(tableLogicalName);
  return {
    [`${lambdaName}EventSourceMapping`]: {
      Type: 'AWS::Lambda::EventSourceMapping',
      Properties: {
        Enabled: true,
        EventSourceArn: streamArn,
        FunctionName: { Ref: lambdaName },
        StartingPosition: 'TRIM_HORIZON'
      }
    },
    [`${lambdaNameTemplate(tableLogicalName)}Role`]: lambdaRoleTemplate(
      tableLogicalName,
      bucketLogicalName
    ),
    [lambdaName]: {
      Type: 'AWS::Lambda::Function',
      Properties: {
        Handler: 'index.handler',
        Role: {
          'Fn::GetAtt': [`${lambdaNameTemplate(tableLogicalName)}Role`, 'Arn']
        },
        Code: {
          ZipFile: {
            'Fn::Sub': (
              `
            const AWS = require('aws-sdk');
            const s3 = new AWS.S3({});

            module.exports.handler = function (event, context, callback) {
              const records = event.Records;
              Promise.all(records.map(record => {
                console.log('record=>', record.dynamodb);
                const keysList = Object.keys(record.dynamodb.Keys).map(key => {
                  const keyDefinition = record.dynamodb.Keys[key];
                  const type = Object.keys(keyDefinition)[0];
                  const value = keyDefinition[type];
                  return value;
                });
                const keysString = keysList.join('/');
                const image = record.dynamodb.NewImage;
                return s3.putObject({
                  Bucket: '\${${bucketLogicalName}}',
                  Key: '\${${tableLogicalName}}/' + keysString + '/image.json',
                  Body: JSON.stringify(image)
                })
                .promise()
                .then(response => {
                  console.log('Snapshot done', response);
                })
                .catch(err => {
                  console.error('Error', err);
                  callback('An error occurred while putting an Item to S3.');
                });
              }))
              .then(() => {
                console.log('All done with', records.length, 'records');
                callback();
              })
              .catch(err => {
                console.error('Error', err);
                callback('Error in Promise.all');
              });
            }
`
            )
          }
        },
        Runtime: 'nodejs4.3',
        Timeout: '25'
      }
    }
  };
};
