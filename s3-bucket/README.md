
s3-bucket
===

Creates an S3 Bucket. The Physical Bucket name is automatically generated.  
You can refer to this resource using `{ Ref: '<bucketLogicalName>' }`.  
This snippet is composable with all the others `s3-bucket-*` snippets.

![](https://nodei.co/npm/dawson-snippets.png?mini=true)

### Usage

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

### Tests

[s3-bucket.spec.js](__tests__/s3-bucket.spec.js)
