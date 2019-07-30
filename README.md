# Project Management Application
## Year 3, Semester 1 Coursework in Cloud Application Development
This is a serverless application to allow users to create/manage projects. The project is built on the Amazon Web Services infrastructure

### Specific README files
* [Backend](server/README.md)
* [Frontend](client/README.md)

## Installation Instructions
### Backend
The backend consists of several AWS Lambda functions, invoked by an API gateway and creating, updating, storing and deleting data from a DynamoDB NoSQL Database

It can be deployed as follows:

0. Run tests and linter with `npm test` and `npm run lint` respectively
1. Install the AWS cli & the serverless framework
2. Create user in IAM for the AWS CLI
3. Set up AWS credentials for the CLI (by running `aws configure`)
4. `cd` into the `server` folder
5. Manually create a Cognito User pool and hosted web page
6. Update the `COGNITO_POOL` environment variable in `serverless.yml` with the created user pool ID
7. Run `sls deploy` to deploy the API

Take note of the execution base URL, as it is required for configuring the backend.

### Frontend
The frontend consists of a React single page application. It can be deployed to any web hosting, but in this instance uses AWS S3 and CloudFront

It can be deployed as follows:
1. `cd` into the `client` folder
2. Run `npm install` to install dependencies locally
3. Update the `src/config/config.ts` file with the base execution URL and the URL of the hosted sign in page
4. Run `npm run build` to generate the build folder with compiled TypeScript
5. Create an S3 bucket
6. Upload the contents of the `build` folder to the newly created S3 bucket
7. Create a new CloudFront distribution, linking it to the S3 bucket. Note: Set the "Default Root Path" as `index.html`
