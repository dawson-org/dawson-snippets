module.exports = params => {
  const tableLogicalName = params.tableLogicalName;
  const primaryKeyName = params.primaryKeyName;
  const enableStream = params.enableStream || false;
  const properties = {
    AttributeDefinitions: [
      {
        AttributeName: primaryKeyName,
        AttributeType: 'S'
      }
    ],
    KeySchema: [{ AttributeName: primaryKeyName, KeyType: 'HASH' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: '1',
      WriteCapacityUnits: '1'
    }
  };
  if (enableStream) {
    properties.StreamSpecification = { StreamViewType: 'NEW_IMAGE' };
  }
  return {
    [tableLogicalName]: {
      Type: 'AWS::DynamoDB::Table',
      DeletionPolicy: 'Retain',
      Properties: properties
    }
  };
};
