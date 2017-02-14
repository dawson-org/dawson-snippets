module.exports = params => {
  const bucketLogicalName = params.bucketLogicalName;
  return {
    [bucketLogicalName]: {
      Type: 'AWS::S3::Bucket',
      Properties: {
        CorsConfiguration: {
          CorsRules: [
            {
              AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
              AllowedHeaders: [
                'authorization',
                'origin',
                'content-md5',
                'content-type',
                'x-amz-date',
                'x-amz-security-token',
                'x-amz-user-agent',
                'x-amz-acl'
              ],
              AllowedOrigins: ['*'],
              ExposedHeaders: ['ETag']
            }
          ]
        }
      },
      DeletionPolicy: 'Retain'
    }
  };
};
