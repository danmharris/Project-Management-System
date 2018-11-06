import * as AWS from "aws-sdk";
import * as expect from "expect";
import { describe, it } from "mocha";
import * as sinon from "sinon";

import { isProjectParams, Project, ProjectParams, ProjectStatus } from "../models/project";
import APIError from '../error';

describe("Project", () => {
    let params: ProjectParams;
    let dbh: any;
    let proj: Project;

    beforeEach(() => {
        params = {
            name: "name",
            description: "description",
            manager: "abc",
        };
        dbh = new AWS.DynamoDB.DocumentClient();
        proj = new Project(params, dbh);
    });

    describe("getting from database by id", () => {
        it("should return correct values", () => {
            const getStub = sinon.stub(dbh, "get").callsFake((req, next) => {
                next(null, {
                    Item: {
                        uuid: "123",
                        name: "A project",
                        description: "Project description",
                        status: 1,
                        manager: "abc",
                    },
                });
            });

            return Project.getById("123", dbh).then((dbProj: Project) => {
                expect(getStub.called);
                expect(dbProj.uuid).toBe("123");
                expect(dbProj.name).toBe("A project");
                expect(dbProj.description).toBe("Project description");
                expect(dbProj.status).toBe(ProjectStatus.ACTIVE);
                expect(dbProj.manager).toEqual("abc");
            });
        });

        it("should return an error if API fails", () => {
            const getFailStub = sinon.stub(dbh, "get").callsFake((req, next) => {
                next("error", null);
            });

            return Project.getById("123", dbh).catch((err: APIError) => {
                expect(getFailStub.called);
                expect(err.message).toBe("Unable to retrieve project");
                expect(err.status).toBe(500);
            });
        });
    });

    describe("getting all", () => {
        it("should return correct values", () => {
            const scanStub = sinon.stub(dbh, "scan").callsFake((req, next) => {
                next(null, {
                    Items: [
                        {
                            uuid: "123",
                            name: "A project",
                            description: "Project description",
                            status: 1,
                            manager: "abc",
                        },
                        {
                            uuid: "456",
                            name: "Another Project",
                            description: "Project description 2",
                            status: 1,
                            manager: "abc",
                        },
                    ],
                });
            });

            return Project.getAll(dbh).then((projects: Project[]) => {
                expect(scanStub.called);
                expect(projects.length).toEqual(2);
                expect(projects[0].uuid).toEqual("123");
                expect(projects[1].uuid).toEqual("456");
            });
        });

        it("should return an error if API fails", () => {
            const scanFailStub = sinon.stub(dbh, "scan").callsFake((req, next) => {
                next("error", null);
            });

            return Project.getAll(dbh).catch((err: APIError) => {
                expect(scanFailStub.called);
                expect(err.message).toBe("Unable to retrieve projects");
                expect(err.status).toBe(500);
            });
        });
    });

    describe("Constructor", () => {

        it("should set properties based on parameters", () => {
            expect(proj.name).toEqual("name");
            expect(proj.description).toEqual("description");
            expect(proj.manager).toEqual("abc");
        });

        it("should set the UUID if provided", () => {
            params.uuid = "123";

            proj = new Project(params, null);
            expect(proj.uuid).toEqual("123");
        });

        it("should generate a uuid if not provided", () => {
            expect(proj.uuid).toBeTruthy();
        });

        it("should set the status if provided", () => {
            params.status = ProjectStatus.DONE;
            proj = new Project(params, null);
            expect(proj.status).toEqual(ProjectStatus.DONE);
        });

        it("should set status to PENDING if not provided", () => {
            expect(proj.status).toEqual(ProjectStatus.PENDING);
        });

        it("should set developers if provided", () => {
            params.developers = ["abc"];
            proj = new Project(params, null);
            expect(proj.developers).toEqual(["abc"]);
        });
    });

    describe("Setters", () => {
        it("should set correct values for individual fields", () => {
            proj.name = "new name";
            expect(proj.name).toEqual("new name");
            proj.description = "new description";
            expect(proj.description).toEqual("new description");
            proj.status = ProjectStatus.DONE;
            expect(proj.status).toEqual(ProjectStatus.DONE);
            proj.manager = "123";
            expect(proj.manager).toEqual("123");
        });
    });

    describe("get/set params", () => {
        it("should update the name if provided", () => {
            const newParams = {
                name: "new name",
            };

            proj.setParams(newParams);

            expect(proj.name).toEqual("new name");
        });

        it("should update the description if provided", () => {
            const newParams = {
                description: "new description",
            };

            proj.setParams(newParams);

            expect(proj.description).toEqual("new description");
        });

        it("should update the status if provided", () => {
            const newParams = {
                status: ProjectStatus.DONE,
            };

            proj.setParams(newParams);

            expect(proj.status).toEqual(ProjectStatus.DONE);
        });

        it("should update the manager if provided", () => {
            const newParams = {
                manager: "123",
            };

            proj.setParams(newParams);
            expect(proj.manager).toEqual("123");
        });

        it("should update combinations of fields", () => {
            const newParams = {
                name: "new name",
                description: "new description",
                status: ProjectStatus.DONE,
                manager: "123",
            };

            proj.setParams(newParams);

            expect(proj.name).toEqual("new name");
            expect(proj.description).toEqual("new description");
            expect(proj.status).toEqual(ProjectStatus.DONE);
            expect(proj.manager).toEqual("123");
        });

        it("should return all parameters", () => {
            params.uuid = "123";
            params.status = ProjectStatus.DONE;
            proj = new Project(params, null);

            const retrievedParams: ProjectParams = proj.getParams();

            expect(retrievedParams.uuid).toEqual("123");
            expect(retrievedParams.name).toEqual("name");
            expect(retrievedParams.description).toEqual("description");
            expect(retrievedParams.status).toEqual(ProjectStatus.DONE);
            expect(retrievedParams.manager).toEqual("abc");
        });
    });

    describe("save", () => {
        it("should return the uuid if successful", () => {
            const saveStub = sinon.stub(dbh, "put").callsFake((req, next) => {
                next(null, "saved");
            });

            proj.save().then((uuid: string) => {
                expect(saveStub.called);
                expect(uuid).toEqual(proj.uuid);
            });
        });

        it("should return an error if database unsuccessful", () => {
            const failSaveStub = sinon.stub(dbh, "put").callsFake((req, next) => {
                next("err", null);
            });

            proj.save().catch((err: APIError) => {
                expect(failSaveStub.called);
                expect(err.message).toEqual("Error creating project");
                expect(err.status).toBe(500);
            });
        });
    });

    describe("update", () => {
        it("should resolve if successful", () => {
            const updateStub = sinon.stub(dbh, "update").callsFake((req, next) => {
                next(null, "saved");
            });

            proj.update().then((res: any) => {
                expect(updateStub.called);
            });
        });

        it("should return an error if database unsuccessful", () => {
            const failUpdateStub = sinon.stub(dbh, "update").callsFake((req, next) => {
                next("err", null);
            });

            proj.update().catch((err: APIError) => {
                expect(failUpdateStub.called);
                expect(err.message).toEqual("Unable to update project");
                expect(err.status).toBe(500);
            });
        });
    });

    describe("delete", () => {
        it("should resolve if successful", () => {
            const deleteStub = sinon.stub(dbh, "delete").callsFake((req, next) => {
                next(null, "saved");
            });

            proj.delete().then((res: any) => {
                expect(deleteStub.called);
            });
        });

        it("should return an error if database unsuccessful", () => {
            const failDeleteStub = sinon.stub(dbh, "delete").callsFake((req, next) => {
                next("err", null);
            });

            proj.delete().catch((err: APIError) => {
                expect(failDeleteStub.called);
                expect(err.message).toEqual("Unable to delete project");
                expect(err.status).toBe(500);
            });
        });
    });

    describe("add/remove developer", () => {
        it("should resolve if successfully added", () => {
            const addDeveloperStub = sinon.stub(dbh, "update").callsFake((req, next) => {
                next(null, "updated");
            });

            return proj.addDevelopers(["abc"]).then(() => {
                expect(addDeveloperStub.called);
                expect(proj.developers).toEqual(["abc"]);
            });
        });

        it("should resolve if successfully removed", () => {
            const removeDeveloperStub = sinon.stub(dbh, "update").callsFake((req, next) => {
                next(null, "updated");
            });
            params.developers = ["abc"];
            proj = new Project(params, dbh);

            return proj.removeDevelopers(["abc"]).then(() => {
                expect(removeDeveloperStub.called);
                expect(proj.developers).toEqual([]);
            });
        });

        it("should return error if database failure on add", () => {
            const failAddDeveloperStub = sinon.stub(dbh, "update").callsFake((req, next) => {
                next("err", null);
            });

            return proj.addDevelopers(["abc"]).catch((err: APIError) => {
                expect(failAddDeveloperStub.called);
                expect(err.message).toEqual("Unable to add developers to project");
                expect(err.status).toBe(500);
            });
        });

        it("should return error if database failure on remove", () => {
            const failRemoveDeveloperStub = sinon.stub(dbh, "update").callsFake((req, next) => {
                next("err", null);
            });

            return proj.removeDevelopers(["abc"]).catch((err: APIError) => {
                expect(failRemoveDeveloperStub.called);
                expect(err.message).toEqual("Unable to remove developers from project");
                expect(err.status).toBe(500);
            });
        });
    });

    describe("isProjectParams", () => {
        let projectParams: any;

        beforeEach(() => {
            projectParams = {
                name: "name",
                description: "description",
                uuid: "123",
                status: 2,
                manager: "abc",
            };
        });

        it("should return true when required properties provided", () => {
            const res = isProjectParams(projectParams);
            expect(res).toBeTruthy();
        });

        it("should return false if required parameter missing", () => {
            let res = isProjectParams({name: "name"});
            expect(res).toBeFalsy();

            res = isProjectParams(({description: "description"}));
            expect(res).toBeFalsy();
        });

        it("should return an error if name type is wrong", () => {
            projectParams.name = 2;
            const res = isProjectParams(projectParams);
            expect(res).toBeFalsy();
        });

        it("should return an error if description type is wrong", () => {
            projectParams.description = 2;
            const res = isProjectParams(projectParams);
            expect(res).toBeFalsy();
        });

        it("should return an error if uuid type is wrong", () => {
            projectParams.uuid = 2;
            const res = isProjectParams(projectParams);
            expect(res).toBeFalsy();
        });

        it("should return an error if status range is wrong", () => {
            projectParams.status = -1;
            let res = isProjectParams(projectParams);
            expect(res).toBeFalsy();

            projectParams.status = 3;
            res = isProjectParams(projectParams);
            expect(res).toBeFalsy();
        });
    });
});
