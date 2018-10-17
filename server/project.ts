import * as uuidv1 from "uuid/v1";

const TABLE_NAME = "projects";

enum ProjectStatus {
    PENDING = 0,
    ACTIVE = 1,
    DONE = 2,
}

interface ProjectParams {
    uuid?: string;
    name: string;
    description: string;
    status?: ProjectStatus;
    developers?: string[];
    manager: string;
}

const isProjectParams: (obj: any) => boolean = (obj: any) => {
    if (!obj.name || !obj.description || !obj.manager) {
        return false;
    }

    if (typeof obj.name !== "string" || typeof obj.description !== "string") {
        return false;
    }

    if (obj.uuid) {
        if (typeof obj.uuid !== "string") {
            return false;
        }
    }

    if (obj.status) {
        if (typeof obj.status !== "number") {
            return false;
        }

        if (obj.status < 0 || obj.status > 2) {
            return false;
        }
    }

    return true;
};

class Project {
    public static getById(uuid: string, dbh: any): Promise<Project> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                uuid,
            },
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

    public static getAll(dbh: any): Promise<Project[]> {
        const params = {
            TableName: TABLE_NAME,
        };

        return new Promise((resolve, reject) => {
            dbh.scan(params, (err: any, res: any) => {
                if (err) {
                    reject("Unable to retrieve projects");
                } else {
                    const projects: Project[] = [];
                    for (const item of res.Items) {
                        projects.push(new Project(item, dbh));
                    }
                    resolve(projects);
                }
            });
        });
    }

    private _uuid: string;
    private _name: string;
    private _description: string;
    private _status: ProjectStatus;
    private _developers: string[];
    private _manager: string;
    private dbh: any;

    constructor(params: ProjectParams, dbh: any) {
        this._name = params.name;
        this._description = params.description;

        if (params.status) {
            this._status = params.status;
        } else {
            this._status = ProjectStatus.PENDING;
        }

        if (params.uuid) {
            this._uuid = params.uuid;
        } else {
            this._uuid = uuidv1();
        }

        if (params.developers) {
            this._developers = params.developers;
        } else {
            this._developers = [];
        }

        this._manager = params.manager;

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

    get status() {
        return this._status;
    }

    set status(newStatus: ProjectStatus) {
        this._status = newStatus;
    }

    get developers() {
        return this._developers;
    }

    get manager() {
        return this._manager;
    }

    set manager(newManager: string) {
        this._manager = newManager;
    }

    public save(): Promise<string> {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                description: this.description,
                manager: this.manager,
                name: this.name,
                status: this.status,
                uuid: this.uuid,
            },
        };

        return new Promise((resolve, reject) => {
            this.dbh.put(params, (err: any, res: any) => {
                if (err) {
                    reject("Error creating project");
                } else {
                    resolve(this.uuid);
                }
            });
        });
    }

    public update(): Promise<any> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                uuid: this.uuid,
            },
            UpdateExpression: "set #name=:n, description=:d, status=:s, manager=:m",
            ExpressionAttributeNames: {
                "#name": "name",
            },
            ExpressionAttributeValues: {
                ":n" : this.name,
                ":d" : this.description,
                ":s" : this.status,
                ":m" : this.manager,
            },
        };

        return new Promise((resolve, reject) => {
            this.dbh.update(params, (err: any, res: any) => {
                if (err) {
                    reject("Unable to update project");
                } else {
                    // TODO: More meaningful return data here
                    resolve(res);
                }
            });
        });
    }

    public delete(): Promise<any> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                uuid: this.uuid,
            },
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

    public addDevelopers(subs: string[]): Promise<any> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                uuid: this.uuid,
            },
            UpdateExpression: "add developers :d",
            ExpressionAttributeValues: {
                ":d": this.dbh.createSet(subs),
            },
        };

        return new Promise((resolve, reject) => {
            this.dbh.update(params, (err: any, res: any) => {
                if (err) {
                    reject("Unable to add developers to project");
                } else {
                    this._developers.push(...subs);
                    resolve(res);
                }
            });
        });
    }

    public removeDevelopers(subs: string[]): Promise<any> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                uuid: this.uuid,
            },
            UpdateExpression: "delete developers :d",
            ExpressionAttributeValues: {
                ":d": this.dbh.createSet(subs),
            },
        };

        return new Promise((resolve, reject) => {
            this.dbh.update(params, (err: any, res: any) => {
                if (err) {
                    reject("Unable to remove developers from project");
                } else {
                    this._developers = this._developers.filter((dev) => subs.indexOf(dev) < 0);
                    resolve(res);
                }
            });
        });
    }

    public setParams(params: any) {
        if (params.name) {
            this.name = params.name;
        }

        if (params.description) {
            this.description = params.description;
        }

        if (params.status) {
            if (params.status >= 0 && params.status <= 2) {
                this.status = params.status;
            }
        }

        if (params.manager) {
            this.manager = params.manager;
        }
    }

    public getParams(): ProjectParams {
        return {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            status: this.status,
            developers: this.developers,
            manager: this.manager,
        };
    }
}

export { Project, ProjectParams, ProjectStatus, isProjectParams };
