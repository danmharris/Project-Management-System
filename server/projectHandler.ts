import { Callback, Context, Handler } from "aws-lambda";
import * as AWS from "aws-sdk";

import { handle } from "./handler";
import { isProjectParams, Project } from "./project";

const dynamo = new AWS.DynamoDB.DocumentClient();
let user: string;

const projects: Handler = (event: any, context: Context, callback: Callback) => {
    const body = JSON.parse(event.body);
    user = event.requestContext.authorizer.claims.sub;

    switch (event.httpMethod) {
        case "GET":
            handle(getAll(), callback);
            break;
        case "POST":
            handle(post(body), callback);
            break;
        default:
            handle(Promise.reject(`Unsupported method "${event.httpMethod}"`), callback);
            break;
    }
};

const project: Handler = (event: any, context: Context, callback: Callback) => {
    const body = JSON.parse(event.body);
    user = event.requestContext.authorizer.claims.sub;
    const uuid = event.pathParameters.uuid;

    switch (event.httpMethod) {
        case "GET":
            handle(get(uuid), callback);
            break;
        case "PUT":
            handle(put(uuid, body), callback);
            break;
        case "DELETE":
            handle(remove(uuid), callback);
            break;
        default:
            handle(Promise.reject(`Unsupported method "${event.httpMethod}"`), callback);
            break;
    }
};

const projectDevelopers: Handler = (event: any, context: Context, callback: Callback) => {
    const body = JSON.parse(event.body);
    user = event.requestContext.authorizer.claims.sub;
    const uuid = event.pathParameters.uuid;

    switch (event.httpMethod) {
        case "POST":
            handle(addDevelopers(uuid, body), callback);
            break;
        case "DELETE":
            handle(removeDevelopers(uuid, body), callback);
            break;
        default:
            handle(Promise.reject(`Unsupported method "${event.httpMethod}"`), callback);
            break;
    }
};

function get(uuid: string): Promise<any> {
    return Project.getById(uuid, dynamo).then((proj: Project) => {
        return proj.getParams();
    });
}

function getAll(): Promise<any> {
    return Project.getAll(dynamo).then((dbProjects: Project[]) => {
        return dbProjects.map((proj: Project) => proj.getParams());
    });
}

function put(uuid: string, body: any): Promise<any> {
    return Project.getById(uuid, dynamo).then((proj: Project) => {
        if (proj.manager !== user) {
            return Promise.reject("Unauthorized");
        }

        proj.setParams(body);
        return proj.update();
    });
}

function remove(uuid: string): Promise<any> {
    return Project.getById(uuid, dynamo).then((proj: Project) => {
        if (proj.manager !== user) {
            return Promise.reject("Unauthorized");
        }

        return proj.delete();
    });
}

function post(body: any): Promise<any> {
    body.manager = user;

    if (!isProjectParams(body)) {
        return Promise.reject("Invalid request");
    }

    return new Project(body, dynamo).save().then((uuid: string) => {
        return { uuid };
    });
}

function addDevelopers(uuid: string, body: any): Promise<any> {
    return Project.getById(uuid, dynamo).then((proj: Project) => {
        if (proj.manager !== user && body.subs.indexOf(user) < 0) {
            return Promise.reject("Unauthorized");
        }

        return proj.addDevelopers(body.subs);
    });
}

function removeDevelopers(uuid: string, body: any): Promise<any> {
    return Project.getById(uuid, dynamo).then((proj: Project) => {
        if (proj.manager !== user && body.subs.indexOf(user) < 0) {
            return Promise.reject("Unauthorized");
        }

        return proj.removeDevelopers(body.subs);
    });
}

export { projects, project, projectDevelopers };
