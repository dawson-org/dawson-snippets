
dynamodb-backup
===============

Backups items in DynamoDB in real time to an S3 Bucket with Versioning enabled. You can use this to have real-time snapshots of one or more of your DynamoBB tables. 

![](https://nodei.co/npm/ender.png?mini=true)

```js
import createBackupTrigger from 'dawson-snippets/dynamodb-backup';
import merge from 'lodash/merge';

// an _example_ DynamoDB Table,
// make sure to include the StreamSpecification attribute
// otherwise you get a CloudFormation error: "Attribute: StreamArn was not found for resource: XXX"
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

