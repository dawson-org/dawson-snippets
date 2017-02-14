
s3-bucket-cors
===

Creates an S3 Bucket with a basic CORS Configuration. The Physical Bucket Name is automatically generated.  

![](https://nodei.co/npm/dawson-snippets.png?mini=true)

## Usage

```js
// example api.js

import s3Bucket from 'dawson-snippets/s3-bucket';
import merge from 'lodash/merge';

const userBucket = s3BucketCors({
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
* The CORS Configuration is set as described below

    ```js
    AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
    AllowedHeaders: [
      'authorization',
      'origin',
      'content-md5',
      'content-type',
      'x-amz-date',
      'x-amz-security-token',
      'x-amz-user-agent',
      'x-amz-acl' // used by putObject with ACL: 'public-read' in the JS SDK for the Browser
    ],
    AllowedOrigins: ['*'],
    ExposedHeaders: ['ETag'] // used in multipart-uploads by the JS SDK for the Browser
    ```


## Tests

[s3-bucket.spec.js](__tests__/s3-bucket.spec.js)
