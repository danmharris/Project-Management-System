import * as expect from "expect";
import { describe, it } from "mocha";
import * as sinon from "sinon";

import { User } from "../../models/user";
import { UserHandler } from "../../handlers/user";
import { UserSkills } from "../../models/userSkills";

describe("User Handler", () => {
    let userSkills: UserSkills = new UserSkills({
        sub: "123",
        skills: ["1", "2"],
    }, null);
    let getBySubStub = sinon.stub(UserSkills, "getBySub").resolves(userSkills);
    let getGroupStub = sinon.stub(User, "getGroup").resolves("Admins");
    let setGroupStub = sinon.stub(User, "setGroup").resolves();
    let handler: UserHandler;

    beforeEach(() => {
        handler = new UserHandler(null, null, "", "user");
    });

    it("Should get skills for a user", () => {
        return handler.getSkills("user").then((res) => {
            expect(getBySubStub.called);
            expect(res.sub).toEqual("123");
            expect(res.skills).toContain("1");
            expect(res.skills).toContain("2");
        });
    });

    it("Should update skills for own user", () => {
        const updateSkillsSub = sinon.stub(userSkills, "update").resolves();

        return handler.updateSkills("user", { skills: ["1"] }).then(() => {
            expect(updateSkillsSub.called);
        })
    });

    it("Should not allow updating skills of arbitrary user", () => {
        return handler.updateSkills("test", {}).catch((err) => {
            expect(err.message).toEqual("You cannot modify this user");
            expect(err.status).toEqual(403);
        });
    });

    it("Should get group", () => {
        return handler.getGroups("user").then((res) => {
            expect(getGroupStub.called);
            expect(res.group).toEqual("Admins");
        });
    });

    it("Should update group", () => {
        return handler.updateGroup("user", "ProjectManagers").then(() => {
            expect(setGroupStub.called);
        });
    });

    after(() => {
        getBySubStub.restore();
        getGroupStub.restore();
        setGroupStub.restore();
    });
});
