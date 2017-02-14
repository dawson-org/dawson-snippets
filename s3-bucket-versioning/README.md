
s3-bucket-versioning
===

Creates an S3 Bucket with Versioning enabled. The Physical Bucket Name is automatically generated.  

![](https://nodei.co/npm/dawson-snippets.png?mini=true)

## Usage

```js
// example api.js

import s3BucketVersioning from 'dawson-snippets/s3-bucket-versioning';
import merge from 'lodash/merge';

const userBucket = s3BucketVersioning({
  bucketLogicalName: 'UserBucket'
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
* [S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTBucketPUTVersioningStatus.html) will be enabled on this bucket


## Tests

[s3-bucket.spec.js](__tests__/s3-bucket.spec.js)
