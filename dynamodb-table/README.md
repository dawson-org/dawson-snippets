
dynamodb-table
===

Creates a DynamoDB Table with an HASH (String) Primary Key. To add Global Secondary Indexes you can merge [`dynamodb-gsi`](/dynamodb-gsi).
The Physical Table Name is automatically generated.  

![](https://nodei.co/npm/dawson-snippets.png?mini=true)

## Usage

```js
// example api.js

import dynamoDBTable from 'dawson-snippets/dynamodb-table';
import merge from 'lodash/merge';

const barTable = dynamoDBTable({
  tableLogicalName: 'TableBar',
  primaryKeyName: 'BarId',
  enableStream: false // default, this attribute is optional
});

export function processCFTemplate(template) {
  return merge(template, {
    Resources: barTable
  });
}
```

*CloudFormation's Physical Resource Id:* `{ Ref: '<tableLogicalName>' }`  
*AWS Table ARN:* ```{ 'Fn::Sub': `arn:aws:dynamodb:\${AWS::Region}:\${AWS::AccountId}:table/\${<bucketLogicalName>}` }```
*AWS Stream ARN:* ```{ 'Fn::Sub': `\${<bucketLogicalName>.StreamArn}` }```

## Details

* This snippet is composable with all the others `s3-dynamodb-*` snippets
* If `enableStream` is `true` a stream is enabled for this Table (`StreamViewType = 'NEW_IMAGE'`)


## Tests

[dynamodb-table.spec.js](/__tests__/dynamodb-table.spec.js)
