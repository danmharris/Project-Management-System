import { Callback, Context, Handler } from "aws-lambda";
import * as AWS from "aws-sdk";

import { handle } from "./handler";
import { isProjectParams, Project } from "./project";
import { User } from "./user";

const dynamo = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const ses = new AWS.SES({ region: "eu-west-1"});
const COGNITO_POOL = "eu-west-2_zVlfrxmDj";
let user: string;
let groups: string[]

const projects: Handler = (event: any, context: Context, callback: Callback) => {
    const body = JSON.parse(event.body);
    user = event.requestContext.authorizer.claims.sub;
    groups = event.requestContext.authorizer.claims["cognito:groups"];

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
    groups = event.requestContext.authorizer.claims["cognito:groups"];
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
    groups = event.requestContext.authorizer.claims["cognito:groups"];
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
        if (!canWrite(proj)) {
            return Promise.reject("Unauthorized");
        }

        proj.setParams(body);
        return proj.update();
    });
}

function remove(uuid: string): Promise<any> {
    return Project.getById(uuid, dynamo).then((proj: Project) => {
        if (!canWrite(proj)) {
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

    if (!groups) {
        return Promise.reject("Unauthorized");
    }

    return new Project(body, dynamo).save().then((uuid: string) => {
        return { uuid };
    });
}

async function addDevelopers(uuid: string, body: any): Promise<any> {
    const proj: Project = await Project.getById(uuid, dynamo);
    if (!canWrite(proj) && (body.subs.indexOf(user) < 0 || body.subs.length > 1)) {
        return Promise.reject("Unauthorized");
    }

    await proj.addDevelopers(body.subs);

    let users: User[] = await User.getAll(cognito, COGNITO_POOL);
    let message: string;
    if (body.subs.length === 1 && body.subs.indexOf(user) > -1) {
        users = users.filter((user: User) => user.sub === proj.manager);
        message = `${users[0].name} has joined project ${proj.name}`;
    } else {
        users = users.filter((user: User) => body.subs.indexOf(user.sub) > -1);
        message = `You have been added to project ${proj.name}`;
    }

    var emailParams = {
        Destination: {
            ToAddresses: users.map((user: User) => user.email)
        },
        Message: {
            Body: {
                Text: {
                    Charset: "UTF-8",
                    Data: message,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Project developers update",
            },
        },
        Source: "dmh2g16@soton.ac.uk",
    };

    return new Promise<any>((resolve, reject) => {
        ses.sendEmail(emailParams, (err: any, res: any) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

function removeDevelopers(uuid: string, body: any): Promise<any> {
    return Project.getById(uuid, dynamo).then((proj: Project) => {
        if (!canWrite(proj) && (body.subs.indexOf(user) < 0 || body.subs.length > 1)) {
            return Promise.reject("Unauthorized");
        }

        return proj.removeDevelopers(body.subs);
    });
}

function canWrite(proj: Project): boolean {
    if (proj.manager === user) {
        return true;
    }

    if (!groups) {
        return false;
    }

    return groups.indexOf("ProjectManagers") > -1 ||
        groups.indexOf("Admins") > -1;
}

export { projects, project, projectDevelopers };
