
dynamodb-backup
===

Creates a Lambda Function which backups items written to DynamoDB in real-time to an S3 Bucket with Versioning enabled. You can use this to have real-time snapshots for one of your DynamoDB Tables. 

You can include this snippet multiple times provided that you specify different Tables.

![](https://nodei.co/npm/dawson-snippets.png?mini=true)

## Usage
```js
import createBackupTrigger from 'dawson-snippets/dynamodb-backup';
import dynamoDBTable from 'dawson-snippets/dynamodb-table';
import s3BucketVersioning from 'dawson-snippets/s3-bucket-versioning';
import merge from 'lodash/merge';

// an _example_ DynamoDB Table,
// make sure to include the StreamSpecification attribute
// otherwise you get a CloudFormation error: "Attribute: StreamArn was not found for resource: XXX"
const tableUsers = dynamoDBTable({
  tableLogicalName: 'TableUsers',
  primaryKeyName: 'UserId',
  enableStream: true // !important!
});

// an S3 Bucket that's used to store item snapshots,
// it's suggested to enable Versioning, as below:
const bucketBackups = s3BucketVersioning({
  bucketLogicalName: 'DynamoBackupsBucket'
});

// this function will return the appropriate Resources
// including Lambda::Function, IAM::Role and Lambda::EventSourceMapping
const backupResources = createBackupTrigger({
  tableLogicalName: 'TableUsers', // existing DynamoDB Table __Logical__ Resource Id
  bucketLogicalName: 'DynamoBackupsBucket' // existing S3 Bucket __Logical__ Resource Id
});

const resources = merge({}, tableUsers, bucketBackups, backupResources);

export function processCFTemplate(template) {
  return merge(template, {
    Resources: resources
  });
}

```

## Details

* This snippet is not composable and its resources should not be further customized
* both `tableLogicalName` and `bucketLogicalName` must reference Resources in the current `CloudFormation Template`; it's up to you to include the *snippets* to create those resources ([`dynamodb-table`](/dynamodb-table) and [`s3-bucket-versioning`](/s3-bucket-versioning))
* The Lambda Function is automatically created and uploaded, as well as the required Permissions and IAM Roles. The following Resources will be included by this snippet: `AWS::IAM::Role`, `AWS::Lambda::EventSourceMapping`, `AWS::Lambda::Function`


## Tests

[dynamodb-backup.spec.js](/__tests__/dynamodb-backup.spec.js)

