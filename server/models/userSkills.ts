const TABLE_NAME = "users";

interface UserSkillsParams {
    sub: string;
    skills: string[];
}

class UserSkills {
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
                    reject("Unable to retrieve user");
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

    public getParams(): UserSkillsParams {
        return {
            sub: this.sub,
            skills: this.skills,
        };
    }

    public setParams(params: any) {
        if (this.skills) {
            this.skills = params.skills;
        }
    }

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
                    reject("Unable to update user");
                } else {
                    resolve(this);
                }
            });
        });
    }
}

export { UserSkills, UserSkillsParams };
