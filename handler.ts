import * as AWS from 'aws-sdk';
import { Handler, Context, Callback } from 'aws-lambda';
import { Project, ProjectParams } from './project';

const dynamo = new AWS.DynamoDB.DocumentClient();

const projects: Handler = (event: any, context: Context, callback: Callback) => {
    const next = (err: any, res: any) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const body = JSON.parse(event.body);

    switch (event.httpMethod) {
        case 'GET':
            Project.getById(event.pathParameters.uuid, dynamo).then((proj: Project) => {
                next(null, proj.getParams());
            })
            break;
        case 'POST':
            const params: ProjectParams = {
                name: body.name,
                description: body.description,
            }
            new Project(params, dynamo).save().then((uuid: string) => {
                next(null, { uuid: uuid});
            });
            break;
        case 'PUT':
            Project.getById(event.pathParameters.uuid, dynamo).then((proj: Project) => {
                proj.setParams(body);
                return proj.update();
            }).then(() => {
                next(null, {});
            });
            break;
        case 'DELETE':
            Project.getById(event.pathParameters.uuid, dynamo).then((proj: Project) => {
                return proj.delete();
            }).then(() => {
                next(null, {});
            });
            break;
        default:
            next(new Error(`Unsupported method "${event.httpMethod}"`), null);
    }
};

export { projects };