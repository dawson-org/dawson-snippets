import fs from 'fs';
import test from 'ava';

import createDynamodbBackupTrigger from '../dynamodb-backup';

import merge from 'lodash/merge';

// an _example_ DynamoDB Table,
// make sure to include the StreamSpecification attribute
// otherwise you get a CloudFormation error: "Attribute: StreamArn was not found for resource: XXX"
const tableUsers = {
  TableUsers: {
    Type: 'AWS::DynamoDB::Table',
    DeletionPolicy: 'Retain',
    Properties: {
      AttributeDefinitions: [
        {
          AttributeName: 'UserId',
          AttributeType: 'S'
        }
      ],
      KeySchema: [{ AttributeName: 'UserId', KeyType: 'HASH' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: '1',
        WriteCapacityUnits: '1'
      },
      StreamSpecification: { StreamViewType: 'NEW_IMAGE' } // include the StreamSpecification property!
    }
  }
};

// an S3 Bucket that's used to store item snapshots,
// it's suggested to enable Versioning, as below:
const bucketBackups = {
  DynamoBackupsBucket: {
    Type: 'AWS::S3::Bucket',
    Properties: {
      VersioningConfiguration: {
        Status: 'Enabled'
      }
    }
  }
};

// this function will return the appropriate Resources
// including Lambda::Function, IAM::Role and Lambda::EventSourceMapping
const backupResources = createDynamodbBackupTrigger({
  tableLogicalName: 'TableUsers',
  bucketLogicalName: 'DynamoBackupsBucket'
});

const resources = merge({}, tableUsers, bucketBackups, backupResources);

const result = {
  Resources: resources,
  Outputs: {}
};

const expected = {
  Resources: {
    TableUsers: {
      Type: 'AWS::DynamoDB::Table',
      DeletionPolicy: 'Retain',
      Properties: {
        AttributeDefinitions: [
          {
            AttributeName: 'UserId',
            AttributeType: 'S'
          }
        ],
        KeySchema: [
          {
            AttributeName: 'UserId',
            KeyType: 'HASH'
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: '1',
          WriteCapacityUnits: '1'
        },
        StreamSpecification: {
          StreamViewType: 'NEW_IMAGE'
        }
      }
    },
    DynamoBackupsBucket: {
      Type: 'AWS::S3::Bucket',
      Properties: {
        VersioningConfiguration: {
          Status: 'Enabled'
        }
      }
    },
    DynamoDBSnapshotTableUsersEventSourceMapping: {
      Type: 'AWS::Lambda::EventSourceMapping',
      Properties: {
        Enabled: true,
        EventSourceArn: {
          'Fn::GetAtt': ['TableUsers', 'StreamArn']
        },
        FunctionName: {
          Ref: 'DynamoDBSnapshotTableUsers'
        },
        StartingPosition: 'TRIM_HORIZON'
      }
    },
    DynamoDBSnapshotTableUsersRole: {
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
                  Resource: [
                    {
                      'Fn::Sub': 'arn:aws:s3:::${DynamoBackupsBucket}/*'
                    }
                  ]
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
                  Resource: '*'
                }
              ]
            }
          }
        ]
      }
    },
    DynamoDBSnapshotTableUsers: {
      Type: 'AWS::Lambda::Function',
      Properties: {
        Handler: 'index.handler',
        Role: {
          'Fn::GetAtt': ['DynamoDBSnapshotTableUsersRole', 'Arn']
        },
        Code: {
          ZipFile: {
            'Fn::Sub': "\n            const AWS = require('aws-sdk');\n            const s3 = new AWS.S3({});\n\n            module.exports.handler = function (event, context, callback) {\n              const records = event.Records;\n              Promise.all(records.map(record => {\n                console.log('record=>', record.dynamodb);\n                const keysList = Object.keys(record.dynamodb.Keys).map(key => {\n                  const keyDefinition = record.dynamodb.Keys[key];\n                  const type = Object.keys(keyDefinition)[0];\n                  const value = keyDefinition[type];\n                  return value;\n                });\n                const keysString = keysList.join('/');\n                const image = record.dynamodb.NewImage;\n                return s3.putObject({\n                  Bucket: '${DynamoBackupsBucket}',\n                  Key: '${TableUsers}/' + keysString + '/image.json',\n                  Body: JSON.stringify(image)\n                })\n                .promise()\n                .then(response => {\n                  console.log('Snapshot done', response);\n                })\n                .catch(err => {\n                  console.error('Error', err);\n                  callback('An error occurred while putting an Item to S3.');\n                });\n              }))\n              .then(() => {\n                console.log('All done with', records.length, 'records');\n                callback();\n              })\n              .catch(err => {\n                console.error('Error', err);\n                callback('Error in Promise.all');\n              });\n            }\n"
          }
        },
        Runtime: 'nodejs4.3',
        Timeout: '25'
      }
    }
  },
  Outputs: {}
};

test.test('dynamodb-backup', t => {
  t.deepEqual(result, expected);
});
