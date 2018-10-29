import { Callback, Context, Handler} from "aws-lambda";
import * as AWS from "aws-sdk";

import { handle } from "./handler";
import { User } from "./user";
import { UserSkills } from "./userSkills";

const dynamo = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const COGNITO_POOL = "eu-west-2_zVlfrxmDj";
let user: any;
let groups: any;

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

const userGroups: Handler = (event: any, context: Context, callback: Callback) => {
    const body = JSON.parse(event.body);
    groups = event.requestContext.authorizer.claims["cognito:groups"];
    const username = event.pathParameters.username;

    if (!groups) {
        handle(Promise.reject("Unauthorized"), callback);
    }

    if (groups.indexOf("Admins") < 0) {
        handle(Promise.reject("Unauthorized"), callback);
    }

    switch (event.httpMethod) {
        case "GET":
            handle(getGroups(username), callback);
            break;
        case "POST":
            handle(setGroup(username, body.group), callback);
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
    return UserSkills.getBySub(sub, dynamo).then((dbUser: UserSkills) => {
        return dbUser.getParams();
    });
}

function getGroups(username: string) {
    return User.getGroup(username, cognito, COGNITO_POOL).then((group: string) => {
        return { group };
    });
}

function setGroup(username: string, group: string) {
    return User.setGroup(username, cognito, COGNITO_POOL, group);
}

function getAll() {
    return User.getAll(cognito, COGNITO_POOL).then((cognitoUsers: User[]) => {
        return cognitoUsers.map((cognitoUser: User) => cognitoUser.getParams());
    });
}

export { users, userGroups };
