module.exports = params => {
  const bucketLogicalName = params.bucketLogicalName;
  return {
    [bucketLogicalName]: {
      Type: 'AWS::S3::Bucket',
      Properties: {},
      DeletionPolicy: 'Retain'
    }
  };
};
