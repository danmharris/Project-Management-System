import * as AWS from 'aws-sdk';
import * as uuidv1 from 'uuid/v1';
import { Handler, Context, Callback } from 'aws-lambda';

const dynamo = new AWS.DynamoDB.DocumentClient();

type DoneCallback = (err: any, res: any) => void;

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
            getProject(event.pathParameters.uuid, next);
            break;
        case 'POST':
            insertProject(body.name, body.description, next);
            break;
        case 'DELETE':
            deleteProject(event.pathParameters.uuid, next);
            break;
        default:
            next(new Error(`Unsupported method "${event.httpMethod}"`), null);
    }
};

function insertProject(name: string, description: string, next: DoneCallback) {
    const uuid = uuidv1();

    const params = {
        TableName: "projects",
        Item: {
            "uuid": uuid,
            "name": name,
            "description": description
        }
    };

    dynamo.put(params, (err, res) => {
        if (err) {
            next("Error creating project", null);
        } else {
            const response = {
                uuid: uuid
            };
            next(null, response);
        }
    });
}

function deleteProject(uuid: string, next: DoneCallback) {
    const params = {
        TableName: "projects",
        Key: {
            "uuid": uuid
        }
    };

    dynamo.delete(params, (err, res) => {
        if (err) {
            next("Unable to delete project", null);
        } else {
            next(null, res);
        }
    });
}

function getProject(uuid: string, next: DoneCallback) {
    const params = {
        TableName: "projects",
        Key: {
            "uuid": uuid
        }
    };

    dynamo.get(params, (err, res) => {
        if (err) {
            next("Unable to retrieve project", null);
        } else {
            next(null, res.Item);
        }
    });
}

export { projects };