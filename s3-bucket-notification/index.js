const makePermissionLogicalName = bucketLogicalName =>
  `${bucketLogicalName}NotificationPermission`;

module.exports = params => {
  const bucketLogicalName = params.bucketLogicalName;
  const lambdaLogicalName = params.lambdaLogicalName;
  const eventType = params.eventType || 's3:ObjectCreated:*';
  const filterRules = params.filterRules || [];
  const lambdaConfiguration = {
    Event: eventType,
    Function: { 'Fn::Sub': `\${${lambdaLogicalName}.Arn}` }
  };
  if (filterRules && filterRules.length > 0) {
    lambdaConfiguration.Filter = {
      S3Key: {
        Rules: [filterRules]
      }
    };
  }
  return {
    [bucketLogicalName]: {
      DependsOn: [makePermissionLogicalName(bucketLogicalName)],
      Type: 'AWS::S3::Bucket',
      Properties: {
        NotificationConfiguration: {
          LambdaConfigurations: [lambdaConfiguration]
        }
      },
      DeletionPolicy: 'Retain'
    },
    [makePermissionLogicalName]: {
      Type: 'AWS::Lambda::Permission',
      Properties: {
        Action: 'lambda:invokeFunction',
        FunctionName: { Ref: lambdaLogicalName },
        Principal: 's3.amazonaws.com'
      }
    }
  };
};
