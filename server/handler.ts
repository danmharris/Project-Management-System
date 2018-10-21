import { Callback } from "aws-lambda";

const handle = (promise: Promise<any>, callback: Callback) => {
    promise.then((res) => {
        callback(null, {
            body: JSON.stringify(res),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
            },
            statusCode: "200",
        });
    }).catch((err) => {
        callback(null, {
            body: JSON.stringify(err),
            headers: {
                "Content-Type": "application/json",
            },
            statusCode: "400",
        });
    });
};

export { handle };
