import test from 'ava';
import merge from 'lodash/merge';
import mergeWith from 'lodash/mergeWith';

import createDynamodbBackupTrigger from '../dynamodb-backup';
import dynamoDBTable from '../dynamodb-table';
import dynamoDBGSI, { mergeCustomizer } from '../dynamodb-gsi';

const simpleTable = {
  Resources: {
    TableBar: {
      Type: 'AWS::DynamoDB::Table',
      DeletionPolicy: 'Retain',
      Properties: {
        AttributeDefinitions: [
          {
            AttributeName: 'BarId',
            AttributeType: 'S'
          }
        ],
        KeySchema: [{ AttributeName: 'BarId', KeyType: 'HASH' }],
        ProvisionedThroughput: {
          ReadCapacityUnits: '1',
          WriteCapacityUnits: '1'
        }
      }
    }
  },
  Outputs: {
    TableBar: {
      Value: { Ref: 'TableBar' }
    }
  }
};

test('simpleTable', t => {
  t.deepEqual({
    Resources: dynamoDBTable({
      tableLogicalName: 'TableBar',
      primaryKeyName: 'BarId',
      enableStream: false
    }),
    Outputs: {
      TableBar: {
        Value: { Ref: 'TableBar' }
      }
    }
  },
  simpleTable
  );
});


const usersTable = merge(
  {
    Resources: {
      TableUsers: {
        Type: 'AWS::DynamoDB::Table',
        DeletionPolicy: 'Retain',
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: 'UserId',
              AttributeType: 'S'
            },
            {
              AttributeName: 'Email',
              AttributeType: 'S'
            },
            {
              AttributeName: 'Token',
              AttributeType: 'S'
            }
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'email-global-index',
              KeySchema: [{ AttributeName: 'Email', KeyType: 'HASH' }],
              Projection: {
                NonKeyAttributes: ['Password', 'Token'],
                ProjectionType: 'INCLUDE'
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: '1',
                WriteCapacityUnits: '1'
              }
            },
            {
              IndexName: 'token-global-index',
              KeySchema: [{ AttributeName: 'Token', KeyType: 'HASH' }],
              Projection: {
                NonKeyAttributes: ['UserId'],
                ProjectionType: 'INCLUDE'
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: '1',
                WriteCapacityUnits: '1'
              }
            }
          ],
          KeySchema: [{ AttributeName: 'UserId', KeyType: 'HASH' }],
          ProvisionedThroughput: {
            ReadCapacityUnits: '1',
            WriteCapacityUnits: '1'
          },
          StreamSpecification: { StreamViewType: 'NEW_IMAGE' }
        }
      }
    },
    Outputs: {
      TableUsers: {
        Value: { Ref: 'TableUsers' }
      }
    }
  },
  {
    Resources: createDynamodbBackupTrigger({
      tableLogicalName: 'TableUsers',
      bucketLogicalName: 'DynamoBackupsBucket'
    })
  }
);

const usersTableResources = mergeWith(
  dynamoDBTable({
    tableLogicalName: 'TableUsers',
    primaryKeyName: 'UserId',
    enableStream: true
  }),
  dynamoDBGSI({
    tableLogicalName: 'TableUsers',
    gsiKeyName: 'Email',
    projectedAttributes: ['Password', 'Token']
  }),
  dynamoDBGSI({
    tableLogicalName: 'TableUsers',
    gsiKeyName: 'Token',
    projectedAttributes: ['UserId']
  }),
  createDynamodbBackupTrigger({
    tableLogicalName: 'TableUsers',
    bucketLogicalName: 'DynamoBackupsBucket'
  }),
  mergeCustomizer
);

test('usersTable', t => {
  t.deepEqual({
    Resources: usersTableResources,
    Outputs: {
      TableUsers: {
        Value: { Ref: 'TableUsers' }
      }
    }
  },
  usersTable
  );
});
