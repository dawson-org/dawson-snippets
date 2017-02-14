
s3-bucket-notification
===

Creates an S3 Bucket which sends Notifications to a Lambda Function you have defined. The Physical Bucket Name is automatically generated.  

![](https://nodei.co/npm/dawson-snippets.png?mini=true)

## Usage

```js
// example api.js

import s3BucketNotification from 'dawson-snippets/s3-bucket-notification';
import merge from 'lodash/merge';

const userBucket = s3BucketNotification({
  bucketLogicalName: 'UserBucket',
  lambdaLogicalName: 'HandleUserBucketPut', // Logical Resource Id of a Lambda::Function that exists in the current CloudFormation Template
  eventType: 's3:ObjectCreated:*', // default, this property is optional
  filterRules: [] // default, this property is optional
});

export function processCFTemplate(template) {
  return merge(template, {
    Resources: {
      ...userBucket,
    }
  });
}
```

*CloudFormation's Physical Resource Id:* `{ Ref: '<bucketLogicalName>' }`  
*AWS ARN:* ```{ 'Fn::Sub': `arn:aws:s3:::\${<bucketLogicalName>}` }```


## Details

* This snippet is composable with all the others `s3-bucket-*` snippets
* This snipped does not create a Lambda Function. You must specify a Logical Resource Id of a Lambda Function that is defined in the current `CloudFormation Template`
* Appropriate `Lambda::Permission` are automatically added, allowing your Lambda Function to be called by S3
* [Documentation for the `eventType` property](https://docs.aws.amazon.com/AmazonS3/latest/dev/NotificationHowTo.html) (scroll to «Supported Event Types»)
* [Documentation for the `filterRules` property](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-notificationconfiguration-config-filter-s3key-rules.html), example: ```[{ Name: 'suffix', Value: 'latest/data.json' }]```



## Tests

[s3-bucket.spec.js](__tests__/s3-bucket.spec.js)
