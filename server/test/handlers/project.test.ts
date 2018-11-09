import * as expect from "expect";
import { describe, it } from "mocha";
import * as sinon from "sinon";

import { ProjectHandler } from "../../handlers/project";
import { Project } from "../../models/project";

describe("Project Handler", () => {
    const project: Project = new Project({
        name: "Project",
        description: "Description",
        manager: "test",
        status: 0,
    }, null);
    const getByidStub = sinon.stub(Project, "getById").resolves(project);
    let handler: ProjectHandler;

    beforeEach(() => {
        handler = new ProjectHandler(null, null, null, "testPool", "user", ["Admins"]);
    });

    it("Should get details of project by id", () => {
        return handler.getById("id").then((res) => {
            expect(getByidStub.called);
            expect(res.name).toEqual("Project");
            expect(res.description).toEqual("Description");
            expect(res.manager).toEqual("test");
            expect(res.status).toEqual(0);
        });
    });

    it("Should update a project", () => {
        const updateProjectStub = sinon.stub(project, "update").resolves();
        return handler.update("id", {
            name: "New Name",
            description: "New description",
        }).then(() => {
            expect(updateProjectStub.called);
            expect(project.name).toEqual("New Name");
            expect(project.description).toEqual("New description");
        });
    });

    it("Should not update if user not owner & not admin", () => {
        handler  = new ProjectHandler(null, null, null, "testPool", "user", []);
        return handler.update("id", {}).catch((err) => {
            expect(err.message).toEqual("You cannot update this project");
            expect(err.status).toEqual(403);
        });
    });

    it("Should allow update if user is owner", () => {
        handler  = new ProjectHandler(null, null, null, "testPool", "test", ["Developers"]);
        return handler.update("id", {}).then(() => {
            expect(true);
        });
    });

    it("Should get all projects", () => {
        const getAllprojectStub = sinon.stub(Project, "getAll").resolves([
            project,
            new Project({
                name: "Project 2",
                description: "Description 2",
                manager: "test",
                status: 1,
            }, null),
        ]);

        return handler.getAll().then((res) => {
            expect(getAllprojectStub.called);
            expect(res.length).toEqual(2);
            getAllprojectStub.restore();
        });
    });

    it("Should remove project", () => {
        const removeProjectStub = sinon.stub(project, "delete").resolves();

        return handler.remove("id").then(() => {
            expect(removeProjectStub.called);
        });
    });

    it("Should not allow removal of project if not owner", () => {
        handler  = new ProjectHandler(null, null, null, "testPool", "user", ["Developers"]);

        return handler.remove("id").catch((err) => {
            expect(err.message).toEqual("You cannot remove this project");
            expect(err.status).toEqual(403);
        });
    });

    it("Should allow removing developers", () => {
        const removeDeveloperStub = sinon.stub(project, "removeDevelopers").resolves();

        return handler.removeDevelopers("id", { subs: ["123"] }).then(() => {
            expect(removeDeveloperStub.called);
        });
    });

    it("Should not allow developers to add arbitrary users", () => {
        handler  = new ProjectHandler(null, null, null, "testPool", "user", ["Developers"]);

        return handler.removeDevelopers("id", { subs: ["123"] }).catch((err) => {
            expect(err.message).toEqual("You cannot edit developers this project");
            expect(err.status).toEqual(403);
        });
    });

    it("Should not allow developers to add multiple users", () => {
        handler  = new ProjectHandler(null, null, null, "testPool", "user", ["Developers"]);

        return handler.removeDevelopers("id", { subs: ["123", "user"] }).catch((err) => {
            expect(err.message).toEqual("You cannot edit developers this project");
            expect(err.status).toEqual(403);
        });
    });

    after(() => {
        getByidStub.restore();
    });
});
