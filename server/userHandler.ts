import { Callback, Context, Handler} from "aws-lambda";
import * as AWS from "aws-sdk";

import { handle } from "./handler";
import { User } from "./user";
import { UserSkills } from "./userSkills";

const dynamo = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const COGNITO_POOL = "eu-west-2_zVlfrxmDj";
let user: any;

const users: Handler = (event: any, context: Context, callback: Callback) => {
    const body = JSON.parse(event.body);
    user = event.requestContext.authorizer.claims.sub;

    switch (event.httpMethod) {
        case "POST":
            handle(post(event.pathParameters.sub, body), callback);
            break;
        case "GET":
            if (event.pathParameters) {
                handle(get(event.pathParameters.sub), callback);
            } else {
                handle(getAll(), callback);
            }
            break;
        default:
            handle(Promise.reject(`Unsupported method "${event.httpMethod}"`), callback);
            break;
    }
};

function post(sub: string, body: any) {
    if (sub !== user) {
        return Promise.reject("Unauthorized");
    }

    return UserSkills.getBySub(sub, dynamo).then((dbUser: UserSkills) => {
        dbUser.setParams(body);
        return dbUser.update();
    });
}

function get(sub: string) {
    if (sub !== user) {
        return Promise.reject("Unauthorized");
    }

    return UserSkills.getBySub(sub, dynamo).then((dbUser: UserSkills) => {
        return dbUser.getParams();
    });
}

function getAll() {
    return User.getAll(cognito, COGNITO_POOL).then((cognitoUsers: User[]) => {
        return cognitoUsers.map((cognitoUser: User) => cognitoUser.getParams());
    });
}

export { users };
