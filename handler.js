const AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.projects = (event, context, callback) => {
    const next = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const body = JSON.parse(event.body);

    switch (event.httpMethod) {
        case 'POST':
            insertProject(body.name, body.description, next);
            break;
        default:
            next(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};

function insertProject(name, description, next) {
    const uuid = uuidv1();

    const params = {
        TableName: "projects",
        Item: {
            "uuid": uuid,
            "name": name,
            "description": description
        }
    };

    dynamo.put(params, next);
}

