import { Callback, Context, Handler} from "aws-lambda";
import * as AWS from "aws-sdk";

import { handle } from "./handler";
import { User } from "./user";

const dynamo = new AWS.DynamoDB.DocumentClient();

const users: Handler = (event: any, context: Context, callback: Callback) => {
    const body = JSON.parse(event.body);

    switch (event.httpMethod) {
        case "POST":
            handle(post(body), callback);
            break;
        case "PUT":
            handle(put(event.pathParameters.sub, body), callback);
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

function post(body: any) {
    return new User(body, dynamo).save().then((sub: string) => {
        return { sub };
    });
}

function get(sub: string) {
    return User.getById(sub, dynamo).then((user: User) => {
        return user.getParams();
    });
}

function getAll() {
    return User.getAll(dynamo).then((dbUsers: User[]) => {
        return dbUsers.map((user: User) => user.getParams);
    });
}

function put(sub: string, body: any) {
    return User.getById(sub, dynamo).then((user: User) => {
        user.setParams(body);
        return user.update();
    });
}

export { users };
