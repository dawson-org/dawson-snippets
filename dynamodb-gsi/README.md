
dynamodb-gsi
===

Adds a Global Secondary Index (with an String Partition/Hash Key) to a DynamoDB Table.
The Index Name equals `<lowercased-gsiKeyName>-global-index`.  

This snippet **does not define a Table**. Use [`dynamodb-table`](/dynamodb-table) and then merge one or more of 
this snippet to add [up to 5](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html) Global Secondary Indexes.

![](https://nodei.co/npm/dawson-snippets.png?mini=true)

## Usage

```js
// example api.js

import dynamoDBTable from 'dawson-snippets/dynamodb-table';
import dynamoGSI, { mergeCustomizer } from 'dawson-snippets/dynamodb-gsi';
import merge from 'lodash/merge';
import mergeWith from 'lodash/mergeWith';

const usersTable = dynamoDBTable({
  tableLogicalName: 'TableUsers',
  primaryKeyName: 'UserId'
});

const emailGSI = dynamoDBGSI({
  tableLogicalName: 'TableUsers',
  gsiKeyName: 'Email',
  projectedAttributes: ['Password', 'SessionToken'] // optional, defaults to undefined
});

const sessionTokenGSI = dynamoDBGSI({
  tableLogicalName: 'TableUsers',
  gsiKeyName: 'SessionToken',
  projectedAttributes: ['UserId'] // optional, defaults to undefined
});

const usersTableResources = mergeWith(
  usersTable,
  emailGSI,
  sessionTokenGSI,
  mergeCustomizer
);

export function processCFTemplate(template) {
  return merge(template, {
    Resources: usersTableResources
  });
}
```

*CloudFormation's Physical Resource Id:* `{ Ref: '<tableLogicalName>' }`  
*AWS DynamoDB Table ARN:* ```{ 'Fn::Sub': `arn:aws:dynamodb:\${AWS::Region}:\${AWS::AccountId}:table/\${<bucketLogicalName>}` }```  
*AWS DynamoDB Table Index ARN:* ```{ 'Fn::Sub': `arn:aws:dynamodb:\${AWS::Region}:\${AWS::AccountId}:table/\${<bucketLogicalName>}/<attributeName>-global-index` }```  
*AWS DynamoDB Stream ARN:* ```{ 'Fn::Sub': `\${<bucketLogicalName>.StreamArn}` }```

## Details

* This snippet is composable with all the others `dynamodb-*` snippets
* If `projectedAttributes` is specified, then *only the specified table attributes are projected into the index*; else *all of the table attributes are projected into the index* ([AWS Documentation for INCLUDE and ALL](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-projectionobject.html)).  
* `lodash.merge` does not `.concat` Arrays, so you need to use `lodash.mergeWith` to add many GSIs without overwriting previous ones or overriding Primary Key's Schema. `mergeCustomizer` is a shortcut [customizer function](https://lodash.com/docs/4.17.4#mergeWith).
* This snippet supports Global Secondary Indexes with a Partition (Hash) Key of type String
* Provisoned Throughput is set to 1 for both Read and Write Capacity


## Tests

[dynamodb-table.spec.js](/__tests__/dynamodb-table.spec.js)
