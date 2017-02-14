
s3-bucket
===

Creates an S3 Bucket with a basic CORS Configuration. The Physical Bucket Name is automatically generated.  

![](https://nodei.co/npm/dawson-snippets.png?mini=true)

## Usage

```js
// example api.js

import s3Bucket from 'dawson-snippets/s3-bucket';
import merge from 'lodash/merge';

const userBucket = s3Bucket({
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


## Tests

[s3-bucket.spec.js](__tests__/s3-bucket.spec.js)
