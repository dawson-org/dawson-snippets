module.exports = params => {
  const tableLogicalName = params.tableLogicalName;
  const gsiKeyName = params.gsiKeyName;
  const projectedAttributes = params.projectedAttributes || [];
  const attributeDefinitions = [{
    AttributeName: gsiKeyName,
    AttributeType: 'S'
  }];
  const globalSecondaryIndexes = [{
    IndexName: `${gsiKeyName.toLowerCase()}-global-index`,
    KeySchema: [{ AttributeName: gsiKeyName, KeyType: 'HASH' }],
    Projection: 'ALL',
    ProvisionedThroughput: {
      ReadCapacityUnits: '1',
      WriteCapacityUnits: '1'
    }
  }];
  if (projectedAttributes && projectedAttributes.length > 0) {
    globalSecondaryIndexes[0].Projection = {
      NonKeyAttributes: projectedAttributes,
      ProjectionType: 'INCLUDE'
    };
  }
  const properties = {
    AttributeDefinitions: attributeDefinitions,
    GlobalSecondaryIndexes: globalSecondaryIndexes
  };
  return {
    [tableLogicalName]: {
      Properties: properties
    }
  };
};

// You can pass 'mergeWithCustomizer'
// as the last param to lodash.mergeWith
// so that arrays will be concatenated
module.exports.mergeWithCustomizer = (objValue, srcValue) => {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
};
