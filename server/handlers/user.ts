
import { User } from "../models/user";
import { UserSkills } from "../models/userSkills";

import APIError from '../error';

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

    public async updateSkills(sub: string, body: any) {
        if (sub !== this.user) {
            return Promise.reject(new APIError("You cannot modify this user", 403));
        }

        const dbUser: UserSkills = await UserSkills.getBySub(sub, this.dynamo);

        dbUser.setParams(body);
        return dbUser.update();
    }

    public async getSkills(sub: string) {
        const dbUser: UserSkills = await UserSkills.getBySub(sub, this.dynamo);

        return dbUser.getParams();
    }

    public async getGroups(username: string) {
        const group: string = await User.getGroup(username, this.cognito, this.COGNITO_POOL);
        return { group };
    }

    public async updateGroup(username: string, group: string) {
        return User.setGroup(username, this.cognito, this.COGNITO_POOL, group);
    }

    public async getAll() {
        const users: User[] = await User.getAll(this.cognito, this.COGNITO_POOL);

        return users.map((cognitoUser: User) => cognitoUser.getParams());
    }
}

export { UserHandler };
