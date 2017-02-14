const makePolicyLogicalName = bucketLogicalName => `${bucketLogicalName}Policy`;

module.exports = params => {
  const bucketLogicalName = params.bucketLogicalName;
  return {
    [bucketLogicalName]: {
      Type: 'AWS::S3::Bucket',
      Properties: {},
      DeletionPolicy: 'Retain'
    },
    [makePolicyLogicalName(bucketLogicalName)]: {
      Type: 'AWS::S3::BucketPolicy',
      Properties: {
        Bucket: { Ref: bucketLogicalName },
        PolicyDocument: {
          Statement: [
            {
              Action: ['s3:GetObject'],
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  ['arn:aws:s3:::', { Ref: bucketLogicalName }, '/*']
                ]
              },
              Principal: '*'
            }
          ]
        }
      }
    }
  };
};
