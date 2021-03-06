const test = require('ava');
const merge = require('lodash/merge');

const s3Bucket = require('../s3-bucket');
const s3BucketVersioning = require('../s3-bucket-versioning');
const s3BucketCors = require('../s3-bucket-cors');
const s3BucketNotification = require('../s3-bucket-notification');
const s3BucketPublicRead = require('../s3-bucket-public-read');

/* s3BucketCors */
const SIMPLE_BUCKET = {
  Resources: {
    AdminBucket: {
      Type: 'AWS::S3::Bucket',
      Properties: {},
      DeletionPolicy: 'Retain'
    }
  },
  Outputs: {
    AdminBucket: {
      Value: { Ref: 'AdminBucket' }
    }
  }
};

test('AdminBucket', t => {
  t.deepEqual(SIMPLE_BUCKET, {
    Resources: s3Bucket({ bucketLogicalName: 'AdminBucket' }),
    Outputs: {
      AdminBucket: {
        Value: { Ref: 'AdminBucket' }
      }
    }
  });
});
/* *** */

/* s3BucketVersioning */
const VERSIONED_BUCKET = {
  Resources: {
    AdminBucket: {
      Type: 'AWS::S3::Bucket',
      Properties: {
        VersioningConfiguration: {
          Status: 'Enabled'
        }
      },
      DeletionPolicy: 'Retain'
    }
  },
  Outputs: {
    AdminBucket: {
      Value: { Ref: 'AdminBucket' }
    }
  }
};

test('AdminBucket', t => {
  t.deepEqual(VERSIONED_BUCKET, {
    Resources: s3BucketVersioning({ bucketLogicalName: 'AdminBucket' }),
    Outputs: {
      AdminBucket: {
        Value: { Ref: 'AdminBucket' }
      }
    }
  });
});
/* *** */

/* s3BucketCors */
const USER_BUCKET = {
  Resources: {
    UserBucket: {
      Type: 'AWS::S3::Bucket',
      Properties: {
        CorsConfiguration: {
          CorsRules: [
            {
              AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
              AllowedHeaders: [
                'authorization',
                'origin',
                'if-none-match',
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
  },
  Outputs: {
    UserBucket: {
      Value: { Ref: 'UserBucket' }
    }
  }
};

test('UserBucket', t => {
  t.deepEqual(USER_BUCKET, {
    Resources: s3BucketCors({ bucketLogicalName: 'UserBucket' }),
    Outputs: {
      UserBucket: {
        Value: { Ref: 'UserBucket' }
      }
    }
  });
});
/* *** */

/* s3BucketCors + s3BucketPublicRead */
const COMPANY_BUCKET = {
  Resources: {
    CompanyBucket: {
      Type: 'AWS::S3::Bucket',
      Properties: {
        CorsConfiguration: {
          CorsRules: [
            {
              AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
              AllowedHeaders: [
                'authorization',
                'origin',
                'if-none-match',
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
    },
    CompanyBucketPolicy: {
      Type: 'AWS::S3::BucketPolicy',
      Properties: {
        Bucket: { Ref: 'CompanyBucket' },
        PolicyDocument: {
          Statement: [
            {
              Action: ['s3:GetObject'],
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  ['arn:aws:s3:::', { Ref: 'CompanyBucket' }, '/*']
                ]
              },
              Principal: '*'
            }
          ]
        }
      }
    }
  },
  Outputs: {
    CompanyBucket: {
      Value: { Ref: 'CompanyBucket' }
    }
  }
};

test('CompanyBucket', t => {
  const resources = merge(
    s3BucketCors({ bucketLogicalName: 'CompanyBucket' }),
    s3BucketPublicRead({ bucketLogicalName: 'CompanyBucket' })
  );
  t.deepEqual(COMPANY_BUCKET, {
    Resources: resources,
    Outputs: {
      CompanyBucket: {
        Value: { Ref: 'CompanyBucket' }
      }
    }
  });
});
/* *** */

/* s3BucketCors + s3BucketNotification */
const COMPANY_SHOWCASE = {
  Resources: {
    CompanyShowcaseBucket: {
      Type: 'AWS::S3::Bucket',
      DependsOn: ['CompanyShowcaseBucketNotificationPermission'],
      Properties: {
        CorsConfiguration: {
          CorsRules: [
            {
              AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
              AllowedHeaders: [
                'authorization',
                'origin',
                'if-none-match',
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
        },
        NotificationConfiguration: {
          LambdaConfigurations: [
            {
              Event: 's3:ObjectCreated:*',
              Function: {'Fn::Sub': '${LambdaHandleShowcase.Arn}'}, // eslint-disable-line
              Filter: {
                S3Key: {
                  Rules: [
                    {
                      Name: 'suffix',
                      Value: 'foo/*'
                    }
                  ]
                }
              }
            }
          ]
        }
      },
      DeletionPolicy: 'Retain'
    },
    CompanyShowcaseBucketNotificationPermission: {
      Type: 'AWS::Lambda::Permission',
      Properties: {
        Action: 'lambda:invokeFunction',
        FunctionName: { Ref: 'LambdaHandleShowcase' },
        Principal: 's3.amazonaws.com'
      }
    }
  },
  Outputs: {
    CompanyShowcaseBucket: {
      Value: { Ref: 'CompanyShowcaseBucket' }
    }
  }
};

test('CompanyShowcaseBucket', t => {
  const resources = merge(
    s3BucketCors({ bucketLogicalName: 'CompanyShowcaseBucket' }),
    s3BucketNotification({
      bucketLogicalName: 'CompanyShowcaseBucket',
      lambdaLogicalName: 'LambdaHandleShowcase',
      filterRules: [
        {
          Name: 'suffix',
          Value: 'foo/*'
        }
      ]
    })
  );
  t.deepEqual(COMPANY_SHOWCASE, {
    Resources: resources,
    Outputs: {
      CompanyShowcaseBucket: {
        Value: { Ref: 'CompanyShowcaseBucket' }
      }
    }
  });
});
/* *** */
