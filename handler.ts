import { Callback } from 'aws-lambda';

const handle = (promise: Promise<any>, callback: Callback) => {
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

export { handle };