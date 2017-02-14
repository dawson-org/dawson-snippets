const makePolicyLogicalName = bucketLogicalName => `${bucketLogicalName}Policy`;

module.exports = params => {
  const bucketLogicalName = params.bucketLogicalName;
  return {
    [bucketLogicalName]: {
      Type: 'AWS::S3::Bucket',
      Properties: {
        VersioningConfiguration: {
          Status: 'Enabled'
        }
      },
      DeletionPolicy: 'Retain'
    }
  };
};
