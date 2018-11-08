import APIError from "../error";

const TABLE_NAME = "users";

interface UserSkillsParams {
    sub: string;
    skills: string[];
}

/**
 * Model class representing the list of skills for a particular user
 */
class UserSkills {
    /**
     * Gets the skills of a given user
     * @param sub The unique sub of the user to get skills for
     * @param dbh Database handler to access information
     */
    public static getBySub(sub: string, dbh: any): Promise<UserSkills> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                sub,
            },
        };

        return new Promise((resolve, reject) => {
            dbh.get(params, (err: any, res: any) => {
                if (err) {
                    reject(new APIError("Unable to retrieve user"));
                } else if (res.Item) {
                    resolve(new UserSkills(res.Item, dbh));
                } else {
                    const emptyParams: UserSkillsParams = {
                        sub,
                        skills: [],
                    };
                    resolve(new UserSkills(emptyParams, dbh));
                }
            });
        });
    }

    private _sub: string = "";
    private _skills: string[] = [];
    private dbh: any;

    /**
     * Construct new instance of user skills from parameters
     * @param params The parameters to create instance from
     * @param dbh Database handler
     */
    constructor(params: UserSkillsParams, dbh: any) {
        this.sub = params.sub;
        this.skills = params.skills;
        this.dbh = dbh;
    }

    get sub() {
        return this._sub;
    }

    set sub(newSub: string) {
        this._sub = newSub;
    }

    get skills() {
        return this._skills;
    }

    set skills(newSkills: string[]) {
        this._skills = newSkills;
    }

    /**
     * Returns the fields of this user as a single object
     */
    public getParams(): UserSkillsParams {
        return {
            sub: this.sub,
            skills: this.skills,
        };
    }

    /**
     * Update all the fields of this user from a single object
     */
    public setParams(params: any) {
        if (this.skills) {
            this.skills = params.skills;
        }
    }

    /**
     * Update the database with the current values in this object
     */
    public update(): Promise<UserSkills> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                sub: this.sub,
            },
            UpdateExpression: "set skills=:s",
            ExpressionAttributeValues: {
                ":s": this.skills,
            },
            ReturnValues: "UPDATED_NEW",
        };

        return new Promise((resolve, reject) => {
            this.dbh.update(params, (err: any, res: any) => {
                if (err) {
                    reject(new APIError("Unable to update user"));
                } else {
                    resolve(this);
                }
            });
        });
    }
}

export { UserSkills, UserSkillsParams };
