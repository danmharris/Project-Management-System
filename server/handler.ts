import { Callback, Context, Handler } from "aws-lambda";
import * as AWS from "aws-sdk";

import { ProjectHandler } from './handlers/project';
import { UserHandler } from "./handlers/user";

const dynamo = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const ses = new AWS.SES({ region: "eu-west-1"});
const COGNITO_POOL = "eu-west-2_zVlfrxmDj";
let user: string;
let groups: string[];
let body: any;

const handle = async (promise: Promise<any>, callback: Callback) => {
    try {
        const res: any = await promise;
        callback(null, {
            body: JSON.stringify(res),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
            },
            statusCode: "200",
        });
    } catch (err) {
        callback(null, {
            body: JSON.stringify(err),
            headers: {
                "Content-Type": "application/json",
            },
            statusCode: "400",
        });
    }
};

const init = (event: any) => {
    body = JSON.parse(event.body);
    user = event.requestContext.authorizer.claims.sub;
    groups = event.requestContext.authorizer.claims["cognito:groups"];
};

const projects: Handler = (event: any, context: Context, callback: Callback) => {
    init(event);
    const projectHandler: ProjectHandler = new ProjectHandler(dynamo, ses, cognito, COGNITO_POOL, user, groups);

    switch (event.httpMethod) {
        case "GET":
            handle(projectHandler.getAll(), callback);
            break;
        case "POST":
            handle(projectHandler.save(body), callback);
            break;
        default:
            handle(Promise.reject(`Unsupported method "${event.httpMethod}"`), callback);
            break;
    }
};

const project: Handler = (event: any, context: Context, callback: Callback) => {
    init(event);
    const uuid = event.pathParameters.uuid;
    const projectHandler: ProjectHandler = new ProjectHandler(dynamo, ses, cognito, COGNITO_POOL, user, groups);

    switch (event.httpMethod) {
        case "GET":
            handle(projectHandler.getById(uuid), callback);
            break;
        case "PUT":
            handle(projectHandler.update(uuid, body), callback);
            break;
        case "DELETE":
            handle(projectHandler.remove(uuid), callback);
            break;
        default:
            handle(Promise.reject(`Unsupported method "${event.httpMethod}"`), callback);
            break;
    }
};

const projectDevelopers: Handler = (event: any, context: Context, callback: Callback) => {
    init(event);
    const uuid = event.pathParameters.uuid;
    const projectHandler: ProjectHandler = new ProjectHandler(dynamo, ses, cognito, COGNITO_POOL, user, groups);

    switch (event.httpMethod) {
        case "POST":
            handle(projectHandler.addDevelopers(uuid, body), callback);
            break;
        case "DELETE":
            handle(projectHandler.removeDevelopers(uuid, body), callback);
            break;
        default:
            handle(Promise.reject(`Unsupported method "${event.httpMethod}"`), callback);
            break;
    }
};

const users: Handler = (event: any, context: Context, callback: Callback) => {
    init(event);
    const userHandler: UserHandler = new UserHandler(dynamo, cognito, COGNITO_POOL, user);

    switch (event.httpMethod) {
        case "POST":
            handle(userHandler.updateSkills(event.pathParameters.sub, body), callback);
            break;
        case "GET":
            if (event.pathParameters) {
                handle(userHandler.getSkills(event.pathParameters.sub), callback);
            } else {
                handle(userHandler.getAll(), callback);
            }
            break;
        default:
            handle(Promise.reject(`Unsupported method "${event.httpMethod}"`), callback);
            break;
    }
};

const userGroups: Handler = (event: any, context: Context, callback: Callback) => {
    init(event);
    const userHandler: UserHandler = new UserHandler(dynamo, cognito, COGNITO_POOL, user);
    const username = event.pathParameters.username;

    if (!groups) {
        handle(Promise.reject("Unauthorized"), callback);
    }

    if (groups.indexOf("Admins") < 0) {
        handle(Promise.reject("Unauthorized"), callback);
    }

    switch (event.httpMethod) {
        case "GET":
            handle(userHandler.getGroups(username), callback);
            break;
        case "POST":
            handle(userHandler.updateGroup(username, body.group), callback);
            break;
        default:
            handle(Promise.reject(`Unsupported method "${event.httpMethod}"`), callback);
            break;
    }
};

export { projects, project, projectDevelopers, users, userGroups };
