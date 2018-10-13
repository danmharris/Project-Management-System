const TABLE_NAME = "users";

interface UserParams {
    sub: string,
    name: string,
    skills: string[],
}

class User {
    private _sub: string;
    private _name: string;
    private _skills: string[];
    private dbh: any;

    constructor(params: UserParams, dbh: any) {
        this._sub = params.sub;
        this._name = params.name;
        this._skills = params.skills;
        this.dbh = dbh;
    }

    get sub() {
        return this._sub;
    }

    get name() {
        return this._name;
    }

    set name(newName: string) {
        this._name = newName;
    }

    get skills() {
        return this._skills;
    }

    set skills(newSkills: string[]) {
        this._skills = newSkills;
    }

    static getById(sub: string, dbh: any): Promise<User> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                "sub": sub,
            },
        };

        return new Promise((resolve, reject) => {
            dbh.get(params, (err: any, res: any) => {
                if(err) {
                    reject("Unable to retrieve user");
                } else {
                    resolve(new User(res.Item, dbh));
                }
            });
        });
    }

    static getAll(dbh: any): Promise<User[]> {
        const params = {
            TableName: TABLE_NAME,
        };

        return new Promise((resolve, reject) => {
            dbh.scan(params, (err: any, res: any) => {
                if(err) {
                    reject("Unable to retrieve users");
                } else {
                    const users: User[] = res.Items.map((item: any) => {
                        return new User(item, dbh);
                    });
                    resolve(users);
                }
            });
        })
    }

    save(): Promise<string> {
        const params = {
            TableName: TABLE_NAME,
            Item: this.getParams(),
        };

        return new Promise((resolve, reject) => {
            this.dbh.put(params, (err:any, res: any) => {
                if(err) {
                    reject("Error saving user");
                } else {
                    resolve(this.sub);
                }
            });
        })
    }

    update(): Promise<any> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                sub: this.sub
            },
            UpdateExpression: "set #name=:n, skills=:s",
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":n": this.name,
                ":s": this.skills,
            },
            ReturnValues: "UPDATED_NEW",
        };

        return new Promise((resolve, reject) => {
            this.dbh.update(params, (err: any, res: any) => {
                if(err) {
                    reject("Unable to update user");
                } else {
                    resolve(res.Attributes);
                }
            });
        });
    }

    getParams(): UserParams {
        return {
            sub: this.sub,
            name: this.name,
            skills: this.skills,
        }
    }

    setParams(params: any) {
        if(params.name) {
            this.name = params.name;
        }

        if(this.skills) {
            this.skills = params.skills;
        }
    }
}

export { User, UserParams };