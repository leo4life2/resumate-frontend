import { Amplify, Auth } from 'aws-amplify';

Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: 'us-east-1',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_6qFQlcIUG',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: '26setj43d68b93bg4ha9ntgdn4',
  },
});


// You can get the current config object
const currentConfig = Auth.configure();

export default currentConfig;