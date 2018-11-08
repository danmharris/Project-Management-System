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

    describe("getGroup", () => {
        it("Should return group if present", () => {
            const getGroupsStub = sinon.stub(cognitoProvider, "adminListGroupsForUser").callsFake((req, next) => {
                next(null, {
                    Groups: [
                        {
                            GroupName: "Admins",
                        },
                    ],
                });
            });

            return User.getGroup("test", cognitoProvider, "testPool").then((res) => {
                expect(getGroupsStub.called);
                expect(res).toEqual("Admins");
            });
        });

        it("Should return Developers if not in group", () => {
            const getGroupsStub = sinon.stub(cognitoProvider, "adminListGroupsForUser").callsFake((req, next) => {
                next(null, {
                    Groups: [],
                });
            });

            return User.getGroup("test", cognitoProvider, "testPool").then((res) => {
                expect(getGroupsStub.called);
                expect(res).toEqual("Developers");
            });
        });

        it("Should throw error on cognito failure", () => {
            const getGroupsStub = sinon.stub(cognitoProvider, "adminListGroupsForUser").callsFake((req, next) => {
                next("err", null);
            });

            return User.getGroup("test", cognitoProvider, "testPool").catch((err) => {
                expect(getGroupsStub.called);
                expect(err.message).toEqual("Unable to get groups");
                expect(err.status).toEqual(500);
            });
        });
    });

    describe("setGroup", () => {
        it("Should move groups if previously a developer", () => {
            const getGroupStub = sinon.stub(User, "getGroup").resolves("Developers");
            const removeFromGroupStub = sinon.stub(cognitoProvider, "adminRemoveUserFromGroup")
                .callsFake((req, next) => next(null, ""));
            const addToGroupStub = sinon.stub(cognitoProvider, "adminAddUserToGroup")
                .callsFake((req, next) => next(null, ""));

            return User.setGroup("test", cognitoProvider, "testPool", "admins").then(() => {
                expect(getGroupStub.called);
                expect(removeFromGroupStub.notCalled);
                expect(addToGroupStub.called);
                getGroupStub.restore();
            });
        });

        it("Should move groups if previously not a developer", () => {
            sinon.reset();
            const getGroupStub = sinon.stub(User, "getGroup").resolves("Admins");
            const removeFromGroupStub = sinon.stub(cognitoProvider, "adminRemoveUserFromGroup")
                .callsFake((req, next) => next(null, ""));
            const addToGroupStub = sinon.stub(cognitoProvider, "adminAddUserToGroup")
                .callsFake((req, next) => next(null, ""));

            return User.setGroup("test", cognitoProvider, "testPool", "admins").then(() => {
                expect(getGroupStub.called);
                expect(removeFromGroupStub.called);
                expect(addToGroupStub.called);
                getGroupStub.restore();
            });
        });

        it("Should move groups if becoming developer", () => {
            const getGroupStub = sinon.stub(User, "getGroup").resolves("Admins");
            const removeFromGroupStub = sinon.stub(cognitoProvider, "adminRemoveUserFromGroup")
                .callsFake((req, next) => next(null, ""));
            const addToGroupStub = sinon.stub(cognitoProvider, "adminAddUserToGroup")
                .callsFake((req, next) => next(null, ""));

            return User.setGroup("test", cognitoProvider, "testPool", "Developers").then(() => {
                expect(getGroupStub.called);
                expect(removeFromGroupStub.called);
                expect(addToGroupStub.notCalled);
                getGroupStub.restore();
            });
        });

        it("Should reject if unable to remove from old group", () => {
            const getGroupStub = sinon.stub(User, "getGroup").resolves("Admins");
            const removeFromGroupStub = sinon.stub(cognitoProvider, "adminRemoveUserFromGroup")
                .callsFake((req, next) => next("err", null));

            return User.setGroup("test", cognitoProvider, "testPool", "Admins").catch((err) => {
                expect(getGroupStub.called);
                expect(removeFromGroupStub.called);
                expect(err.message).toEqual("Unable to remove old group");
                expect(err.status).toEqual(500);
                getGroupStub.restore();
            });
        });

        it("Should reject if unable to add to new group", () => {
            const getGroupStub = sinon.stub(User, "getGroup").resolves("Admins");
            const removeFromGroupStub = sinon.stub(cognitoProvider, "adminRemoveUserFromGroup")
                .callsFake((req, next) => next(null, ""));
            const addToGroupStub = sinon.stub(cognitoProvider, "adminAddUserToGroup")
                .callsFake((req, next) => next("err", null));

            return User.setGroup("test", cognitoProvider, "testPool", "Admins").catch((err) => {
                expect(getGroupStub.called);
                expect(removeFromGroupStub.called);
                expect(addToGroupStub.called);
                expect(err.message).toEqual("Unable to add new group");
                expect(err.status).toEqual(500);
                getGroupStub.restore();
            });
        });

    });
});
