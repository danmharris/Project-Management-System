
import { User } from "../models/user";
import { UserSkills } from "../models/userSkills";

class UserHandler {
    private dynamo: any;
    private cognito: any;
    private COGNITO_POOL: string;
    private user: string;

    constructor(dynamo: any, cognito: any, pool: string, user: string) {
        this.dynamo = dynamo;
        this.cognito = cognito;
        this.COGNITO_POOL = pool;
        this.user = user;
    }

    public updateSkills(sub: string, body: any) {
        if (sub !== this.user) {
            return Promise.reject("Unauthorized");
        }

        return UserSkills.getBySub(sub, this.dynamo).then((dbUser: UserSkills) => {
            dbUser.setParams(body);
            return dbUser.update();
        });
    }

    public getSkills(sub: string) {
        return UserSkills.getBySub(sub, this.dynamo).then((dbUser: UserSkills) => {
            return dbUser.getParams();
        });
    }

    public getGroups(username: string) {
        return User.getGroup(username, this.cognito, this.COGNITO_POOL).then((group: string) => {
            return { group };
        });
    }

    public updateGroup(username: string, group: string) {
        return User.setGroup(username, this.cognito, this.COGNITO_POOL, group);
    }

    public getAll() {
        return User.getAll(this.cognito, this.COGNITO_POOL).then((cognitoUsers: User[]) => {
            return cognitoUsers.map((cognitoUser: User) => cognitoUser.getParams());
        });
    }
}

export { UserHandler };
