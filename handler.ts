import * as AWS from 'aws-sdk';
import { Handler, Context, Callback } from 'aws-lambda';
import { Project } from './project';

const dynamo = new AWS.DynamoDB.DocumentClient();

const projects: Handler = (event: any, context: Context, callback: Callback) => {
    const body = JSON.parse(event.body);

    switch (event.httpMethod) {
        case 'GET':
            handle(get(event.pathParameters.uuid), callback);
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

function handle(promise: Promise<any>, callback: Callback) {
    promise.then(res => {
        callback(null, {
            statusCode: '200',
            body: JSON.stringify(res),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }).catch(err => {
        callback(null, {
            statusCode: '400',
            body: JSON.stringify(err),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    })
}

function get(uuid: string): Promise<any> {
    return Project.getById(uuid, dynamo).then((proj: Project) => {
        return proj.getParams();
    });
}

function put(uuid: string, body: any): Promise<any> {
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
    return new Project(body, dynamo).save().then((uuid: string) => {
        return { uuid: uuid };
    });
}

export { projects };
