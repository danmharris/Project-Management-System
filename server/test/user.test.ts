import * as AWS from "aws-sdk";
import * as expect from "expect";
import { describe, it } from "mocha";
import * as sinon from "sinon";

import { User, UserParams } from "../user";

describe("User", () => {
    let params: UserParams;
    let dbh: any;
    let user: User;

    beforeEach(() => {
        params = {
            sub: "abc123",
            name: "Joe Bloggs",
            skills: ["TypeScript", "AWS"],
        };
        dbh = new AWS.DynamoDB.DocumentClient();
        user = new User(params, dbh);
    });

    describe("getting user by id", () => {
        it("should return correct values", () => {
            const getStub = sinon.stub(dbh, "get").callsFake((req, next) => {
                next(null, {
                    Item: params,
                });
            });

            return User.getById("abc123", dbh).then((dbUser: User) => {
                expect(getStub.called);
                expect(dbUser.sub).toEqual("abc123");
                expect(dbUser.name).toEqual("Joe Bloggs");
                expect(dbUser.skills).toContain("TypeScript");
                expect(dbUser.skills).toContain("AWS");
            });
        });

        it("should return error on database failure", () => {
            const getFailStub = sinon.stub(dbh, "get").callsFake((req, next) => {
                next("err", null);
            });

            return User.getById("abc123", dbh).catch((err: string) => {
                expect(getFailStub.called);
                expect(err).toEqual("Unable to retrieve user");
            });
        });
    });

    describe("getting all", () => {
        it("should return correct values", () => {
            const getAllStub = sinon.stub(dbh, "scan").callsFake((req, next) => {
                next(null, {
                    Items: [
                        {
                            sub: "123",
                            name: "a",
                            skills: ["TypeScript"],
                        },
                        {
                            sub: "456",
                            name: "b",
                            skills: ["AWS"],
                        },
                    ],
                });
            });

            return User.getAll(dbh).then((users: User[]) => {
                expect(getAllStub.called);
                expect(users.length).toEqual(2);
                expect(users[0].sub).toEqual("123");
                expect(users[1].sub).toEqual("456");
            });
        });

        it("should return an error on database error", () => {
            const getAllFailStub = sinon.stub(dbh, "scan").callsFake((req, next) => {
                next("err", null);
            });

            return User.getAll(dbh).catch((err: string) => {
                expect(getAllFailStub.called);
                expect(err).toEqual("Unable to retrieve users");
            });
        });
    });

    describe("saving", () => {

        it("should return uuid if success", () => {
            const saveStub = sinon.stub(dbh, "put").callsFake((req, next) => {
                next(null, "saved");
            });

            user.save().then((sub: string) => {
                expect(saveStub.called);
                expect(sub).toEqual("abc123");
            });
        });

        it("should return error if failure", () => {
            const failSaveStub = sinon.stub(dbh, "put").callsFake((req, next) => {
                next("err", null);
            });

            user.save().catch((err: string) => {
                expect(failSaveStub.called);
                expect(err).toEqual("Error saving user");
            });
        });
    });

    describe("udating", () => {
        it("should resolve if successful", () => {
            const updateStub = sinon.stub(dbh, "update").callsFake((req, next) => {
                next(null, "updated");
            });

            user.update().then(() => {
                expect(updateStub.called);
            });
        });

        it("should return error if database failure", () => {
            const failUpdateStub = sinon.stub(dbh, "update").callsFake((req, next) => {
                next("err", null);
            });

            user.update().catch((err: string) => {
                expect(failUpdateStub.called);
                expect(err).toEqual("Unable to update user");
            });
        });
    });

    describe("constructor", () => {
        it("should set all parameters", () => {
            expect(user.sub).toEqual("abc123");
            expect(user.name).toEqual("Joe Bloggs");
            expect(user.skills.length).toEqual(2);
            expect(user.skills).toContain("TypeScript");
            expect(user.skills).toContain("AWS");
        });
    });

    describe("get/set params", () => {
        it("should return all params", () => {
            const userParams: UserParams = user.getParams();

            expect(userParams.sub).toEqual(user.sub);
            expect(userParams.name).toEqual(user.name);
            expect(userParams.skills).toEqual(user.skills);
        });

        it("should update name if provided", () => {
            user.setParams({name: "John Smith"});
            expect(user.name).toEqual("John Smith");
        });

        it("should update skills if provided", () => {
            user.setParams({skills: ["test"]});
            expect(user.skills).toEqual(["test"]);
        });

        it("should not update sub", () => {
            user.setParams({sub: "123"});
            expect(user.sub).toEqual("abc123");
        });
    });
});
