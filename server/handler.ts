import { Callback, Context, Handler } from "aws-lambda";
import * as AWS from "aws-sdk";

import APIError from "./error";
import { ProjectHandler } from "./handlers/project";
import { UserHandler } from "./handlers/user";

/**
 * Main Handler functions to be provided to Lambda functions
 * They handle the routing from API gateway and pass off to specific handlers
 */

const dynamo = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const ses = new AWS.SES({ region: "eu-west-1"});
let COGNITO_POOL: string;
let user: string; // The user sub
let groups: string[]; // Group(s) the user is in
let body: any; // Body of the request (if any)

/**
 * Generic handler function, takes a promise from a handler and processes
 * its response.
 * @param promise The promise to handle
 * @param callback Function to callback when done (Lambda callback)
 */
const handle = async (promise: Promise<any>, callback: Callback) => {
    try {
        const res: any = await promise;
        callback(null, {
            body: JSON.stringify(res),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            statusCode: "200",
        });
    } catch (err) {
        callback(null, {
            body: JSON.stringify({message: err.message, status: err.status }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            statusCode: err.status,
        });
    }
};

/**
 * Initialises handlers by setting necessary parameters
 * @param event The event passed to the Lambda
 */
const init = (event: any) => {
    body = JSON.parse(event.body);
    user = event.requestContext.authorizer.claims.sub;
    groups = event.requestContext.authorizer.claims["cognito:groups"];
    COGNITO_POOL = process.env.COGNITO_POOL ? process.env.COGNITO_POOL : "";
};

/**
 * All the below functions correspond to a single Lambda function.
 * See serverless.yml for mapping
 *
 * All have a switch statement for the type of request, and pass of to the
 * appropriate handler
 *
 * NOTE: Based off Lambda blueprint
 */

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
            handle(Promise.reject(new APIError(`Unsupported method "${event.httpMethod}"`, 501)), callback);
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
            handle(Promise.reject(new APIError(`Unsupported method "${event.httpMethod}"`, 501)), callback);
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
            handle(Promise.reject(new APIError(`Unsupported method "${event.httpMethod}"`, 501)), callback);
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
            handle(Promise.reject(new APIError(`Unsupported method "${event.httpMethod}"`, 501)), callback);
            break;
    }
};

const userGroups: Handler = (event: any, context: Context, callback: Callback) => {
    init(event);
    const userHandler: UserHandler = new UserHandler(dynamo, cognito, COGNITO_POOL, user);
    const username = event.pathParameters.username;

    if (!groups) {
        handle(Promise.reject(new APIError("Forbidden", 403)), callback);
    }

    if (groups.indexOf("Admins") < 0) {
        handle(Promise.reject(new APIError("Forbidden", 403)), callback);
    }

    switch (event.httpMethod) {
        case "GET":
            handle(userHandler.getGroups(username), callback);
            break;
        case "POST":
            handle(userHandler.updateGroup(username, body.group), callback);
            break;
        default:
            handle(Promise.reject(new APIError(`Unsupported method "${event.httpMethod}"`, 501)), callback);
            break;
    }
};

export { projects, project, projectDevelopers, users, userGroups };
