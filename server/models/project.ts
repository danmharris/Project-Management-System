import * as uuidv1 from "uuid/v1";

import APIError from "../error";

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

/**
 * Checks whether a given object is the type ProjectParams
 *
 * Performs type and value checks
 *
 * @param obj The object to check
 */
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
        if (obj.status < 0 || obj.status > 2) {
            return false;
        }
    }

    return true;
};

/**
 * Model class for an individual Project
 */
class Project {
    /**
     * Static methods for retrieving models from the database
     *
     * Will construct new instances of this class from the result
     */
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
                    reject(new APIError("Unable to retrieve project"));
                } else if (!res.Item) {
                    reject(new APIError("Project not found", 404));
                } else {
                    if (res.Item.developers) {
                        res.Item.developers = res.Item.developers.values;
                    }
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
                    reject(new APIError("Unable to retrieve projects"));
                } else {
                    const projects: Project[] = [];
                    for (const item of res.Items) {
                        if (item.developers) {
                            item.developers = item.developers.values;
                        }
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

    /**
     * Creates a new instance of this class with required parameters
     * and a database handler
     * @param params Parameters to initialise class with
     * @param dbh Database handler (dynamo)
     */
    constructor(params: ProjectParams, dbh: any) {
        this._name = params.name;
        this._description = params.description;

        // Sets default values for some properties if not provided
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

    /**
     * Save this object in the database, returning its new UUID
     */
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
                    reject(new APIError("Error creating project"));
                } else {
                    resolve(this.uuid);
                }
            });
        });
    }

    /**
     * Update the database with the values of this instance
     */
    public update(): Promise<any> {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                uuid: this.uuid,
            },
            UpdateExpression: "set #name=:n, description=:d, #status=:s, manager=:m",
            ExpressionAttributeNames: {
                "#name": "name",
                "#status": "status",
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
                    reject(new APIError("Unable to update project"));
                } else {
                    resolve(res);
                }
            });
        });
    }

    /**
     * Delete this project from the database
     */
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
                    reject(new APIError("Unable to delete project"));
                } else {
                    resolve(res);
                }
            });
        });
    }

    /**
     * Adds new developers to this project
     * @param subs List of user subs to add
     */
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
                    reject(new APIError("Unable to add developers to project"));
                } else {
                    this._developers.push(...subs);
                    resolve(res);
                }
            });
        });
    }

    /**
     * Remove developers from this project
     * @param subs List of developer subs to remove
     */
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
                    reject(new APIError("Unable to remove developers from project"));
                } else {
                    this._developers = this._developers.filter((dev) => subs.indexOf(dev) < 0);
                    resolve(res);
                }
            });
        });
    }

    /**
     * Updates the fields of this project (if present)
     * @param params Parameters to update project with
     */
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

    /**
     * Returns a single object containing all the fields of this project
     */
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
