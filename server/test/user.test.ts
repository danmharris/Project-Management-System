import * as AWS from "aws-sdk";
import * as expect from "expect";
import { describe, it } from "mocha";
import * as sinon from "sinon";

import APIError from "../error";
import { User, UserParams } from "../models/user";

describe("User", () => {
    let cognitoProvider: any;
    const listUsers = (req: any, next: any) => {
        next(null, {
            Users: [
                {
                    Attributes: [
                        {
                            Name: "sub",
                            Value: "abc123",
                        },
                        {
                            Name: "name",
                            Value: "Joe Bloggs",
                        },
                        {
                            Name: "address",
                            Value: "123 Fake Street",
                        },
                        {
                            Name: "email",
                            Value: "joe@example.com",
                        },
                    ],
                },
            ],
        });
    };

    beforeEach(() => {
        cognitoProvider = new AWS.CognitoIdentityServiceProvider();
    });

    describe("Getting All", () => {
        it("Should return array of users on success", () => {
            const listUsersStub = sinon.stub(cognitoProvider, "listUsers").callsFake(listUsers);

            return User.getAll(cognitoProvider, "testPool").then((users: User[]) => {
                expect(listUsersStub.called);
                expect(users.length).toEqual(1);

                expect(users[0].sub).toEqual("abc123");
                expect(users[0].name).toEqual("Joe Bloggs");
                expect(users[0].email).toEqual("joe@example.com");
                expect(users[0].address).toEqual("123 Fake Street");
            });
        });

        it("Should reject on cognito error", () => {
            const listUsersStub = sinon.stub(cognitoProvider, "listUsers").callsFake((req, next) => {
                next("err", null);
            });

            return User.getAll(cognitoProvider, "testPool").catch((err: APIError) => {
                expect(listUsersStub.called);
                expect(err.message).toEqual("Unable to retrieve users");
                expect(err.status).toBe(500);
            });
        });
    });

    describe("getParams", () => {
        it("should return correct values", () => {
            sinon.stub(cognitoProvider, "listUsers").callsFake(listUsers);

            return User.getAll(cognitoProvider, "testPool").then((users: User[]) => {
                const params: UserParams = users[0].getParams();

                expect(params.sub).toEqual("abc123");
                expect(params.name).toEqual("Joe Bloggs");
                expect(params.email).toEqual("joe@example.com");
                expect(params.address).toEqual("123 Fake Street");
            });
        });
    });
});
