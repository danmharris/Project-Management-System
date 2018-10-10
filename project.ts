import * as uuidv1 from 'uuid/v1';

const TABLE_NAME = "projects";

interface ProjectParams {
    uuid?: string,
    name: string,
    description: string,
}

class Project {
    private _uuid: string;
    private _name: string;
    private _description: string;
    private dbh: any;

    constructor(params: ProjectParams, dbh: any) {
        this._name = params.name;
        this._description = params.description;

        if (params.uuid) {
            this._uuid = params.uuid;
        } else {
            this._uuid = uuidv1();
        }

        this.dbh = dbh;
    }

    get uuid() {
        return this._uuid;
    }

    get name() {
        return this._name;
    }

    set name(newName: string) {
        this._name = newName;
    }

    get description() {
        return this._description;
    }

    set description(newDesc: string) {
        this._description = newDesc;
    }

    static getById(uuid: string, dbh: any): Promise<Project> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                "uuid": uuid
            }
        };

        return new Promise((resolve, reject) => {
            dbh.get(params, (err: any, res: any) => {
                if (err) {
                    reject("Unable to retrieve project");
                } else {
                    resolve(new Project(res.Item, dbh));
                }
            });
        });

    }

    save(): Promise<string> {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                "uuid": this.uuid,
                "name": this.name,
                "description": this.description
            }
        };

        return new Promise((resolve, reject) => {
            this.dbh.put(params, (err:any, res:any) => {
                if (err) {
                    reject("Error creating project");
                } else {
                    resolve(this.uuid);
                }
            })
        });
    }

    update(): Promise<any> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                uuid: this.uuid
            },
            UpdateExpression: "set #name=:n, description=:d",
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":n" : this.name,
                ":d" : this.description,
            }
        }

        return new Promise((resolve, reject) => {
            this.dbh.update(params, (err: any, res: any) => {
                if (err) {
                    reject("Unable to update project");
                } else {
                    resolve(res);
                }
            });
        });
    }

    delete(): Promise<any> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                "uuid": this.uuid
            }
        };

        return new Promise((resolve, reject) => {
            this.dbh.delete(params, (err: any, res: any) => {
                if (err) {
                    reject("Unable to delete project");
                } else {
                    resolve(res);
                }
            });
        });
    }

    setParams(params: any) {
        if (params.name) {
            this.name = params.name;
        }

        if (params.description) {
            this.description = params.description;
        }
    }

    getParams(): ProjectParams {
        return {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
        };
    }
}

export { Project, ProjectParams };
