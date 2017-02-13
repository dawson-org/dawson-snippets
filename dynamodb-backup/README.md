
dynamodb-backup
===============

## Example Usage

![](https://nodei.co/npm/ender.png?mini=true)

```js
import createBackupTrigger from 'dawson-snippets/dynamodb-backup';
import merge from 'lodash/merge';

const bucketBackups = {
  DynamoBackupsBucket: {
    Type: 'AWS::S3::Bucket',
    Properties: {}
  }
};

const tableUsers = {
  TableUsers: {
    Type: 'AWS::DynamoDB::Table',
    DeletionPolicy: 'Retain',
    Properties: {
      AttributeDefinitions: [{
        AttributeName: 'UserId',
        AttributeType: 'S'
      }],
      KeySchema: [{ AttributeName: 'UserId', KeyType: 'HASH' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: '1',
        WriteCapacityUnits: '1'
      },
      StreamSpecification: { StreamViewType: 'NEW_IMAGE' } // include the StreamSpecification property!
    }
  }
};

const backupResources = createDynamodbBackupTrigger({
  tableLogicalName: 'TableUsers',
  bucketLogicalName: 'DynamoBackupsBucket'
});

export function processCFTemplate(template) {
  return merge(template, {
    Resources: {
      ...tableUsers,
      ...bucketBackups,
      ...backupResources
    }
  });
}

```

