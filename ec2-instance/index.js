const getInstanceLogicalName = name => {
  return `${name.replace(/([^a-z0-9]+)/gi, '')}Instance`;
};

module.exports = params => {
  const name = params.name;
  const imageId = params.imageId;
  const subnetId = params.subnetId;
  const securityGroupId = params.securityGroupId;

  // optional
  const instanceType = params.instanceType || 't2.micro';
  const keyName = params.keyName;
  const userData = params.userData;

  const properties = {
    DisableApiTermination: true,
    ImageId: imageId,
    InstanceType: instanceType,
    SecurityGroupIds: [securityGroupId],
    SubnetId: subnetId,
    Tags: [{ Key: 'Name', Value: name }]
  };

  if (keyName) {
    properties.KeyName = keyName;
  }

  if (userData) {
    properties.UserData = userData;
  }

  return {
    [getInstanceLogicalName(name)]: {
      Type: 'AWS::EC2::Instance',
      Properties: properties
    }
  };
};

module.exports.getInstanceLogicalName = getInstanceLogicalName;
