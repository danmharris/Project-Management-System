import * as AWS from 'aws-sdk';
import { Handler, Context, Callback } from 'aws-lambda';
import { Project, ProjectParams, isProjectParams } from './project';
import { handle } from './handler';

const dynamo = new AWS.DynamoDB.DocumentClient();

const projects: Handler = (event: any, context: Context, callback: Callback) => {
    const body = JSON.parse(event.body);

    switch (event.httpMethod) {
        case 'GET':
            if(event.pathParameters) {
                handle(get(event.pathParameters.uuid), callback);
            } else {
                handle(getAll(), callback);
            }
            break;
        case 'POST':
            handle(post(body), callback);
            break;
        case 'PUT':
            handle(put(event.pathParameters.uuid, body), callback);
            break;
        case 'DELETE':
            handle(remove(event.pathParameters.uuid), callback);
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
    return Project.getAll(dynamo).then((projects: Project[]) => {
        const params: ProjectParams[] = [];
        for (let project of projects) {
            params.push(project.getParams());
        }

        return params;
    });
}

function put(uuid: string, body: any): Promise<any> {
    if(!isProjectParams(body)) {
        return Promise.reject('Invalid request');
    }

    return Project.getById(uuid, dynamo).then((proj: Project) => {
        proj.setParams(body);
        return proj.update();
    });
}

function remove(uuid: string): Promise<any> {
    return Project.getById(uuid, dynamo).then((proj: Project) => {
        return proj.delete();
    });
}

function post(body: any): Promise<any> {
    if(!isProjectParams(body)) {
        return Promise.reject('Invalid request');
    }

    return new Project(body, dynamo).save().then((uuid: string) => {
        return { uuid: uuid };
    });
}

export { projects };
