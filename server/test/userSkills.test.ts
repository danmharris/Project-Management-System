import * as AWS from "aws-sdk";
import * as expect from "expect";
import { describe, it } from "mocha";
import * as sinon from "sinon";

import { UserSkills, UserSkillsParams } from "../userSkills";

describe("UserSkills", () => {
    let dbh: any;
    let userSkills: UserSkills;

    beforeEach(() => {
        dbh = new AWS.DynamoDB.DocumentClient();
        userSkills = new UserSkills({
            skills: ["TypeScript", "AWS"],
            sub: "abc123",
        }, dbh);
    });

    describe("getting by sub", () => {
        it("should resolve with skills if present", () => {
            const getBySubStub = sinon.stub(dbh, "get").callsFake((req, next) => {
                next(null, {
                    Item: {
                        skills: ["TypeScript", "AWS"],
                        sub: "abc123",
                    },
                });
            });

            return UserSkills.getBySub("abc123", dbh).then((userSkill: UserSkills) => {
                expect(getBySubStub.called);
                expect(userSkill.sub).toEqual("abc123");
                expect(userSkill.skills.length).toEqual(2);
                expect(userSkill.skills).toContain("TypeScript");
                expect(userSkill.skills).toContain("AWS");
            });
        });

        it("should return empty skills if not present", () => {
            const getBySubStub = sinon.stub(dbh, "get").callsFake((req, next) => {
                next(null, {});
            });

            return UserSkills.getBySub("abc123", dbh).then((userSkill: UserSkills) => {
                expect(getBySubStub.called);
                expect(userSkill.sub).toEqual("abc123");
                expect(userSkill.skills.length).toEqual(0);
            });
        });

        it("should return error on db failure", () => {
            const getBySubStub = sinon.stub(dbh, "get").callsFake((req, next) => {
                next("Err", null);
            });

            return UserSkills.getBySub("abc123", dbh).catch((err: string) => {
                expect(getBySubStub.called);
                expect(err).toEqual("Unable to retrieve user");
            });
        });
    });

    describe("update", () => {
        it("should resolve on db success", () => {
            const updateStub = sinon.stub(dbh, "update").callsFake((req, next) => {
                next(null, {});
            });

            return userSkills.update().then((updated: UserSkills) => {
                expect(updateStub.called);
            });
        });

        it("should reject on db failure", () => {
            const updateStub = sinon.stub(dbh, "update").callsFake((req, next) => {
                next("err", null);
            });

            return userSkills.update().catch((err: string) => {
                expect(updateStub.called);
                expect(err).toEqual("Unable to update user");
            });
        });
    });

    describe("get/set params", () => {
        it("should return correct parameters", () => {
            const params: UserSkillsParams = userSkills.getParams();
            expect(params.sub).toEqual("abc123");
            expect(params.skills).toEqual(["TypeScript", "AWS"]);
        });

        it("should update skills if present", () => {
            userSkills.setParams({
                skills: ["React"],
            });

            expect(userSkills.skills).toEqual(["React"]);
        });
    });
});
