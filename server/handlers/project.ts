import { isProjectParams, Project } from "../models/project";
import { User } from "../models/user";

class ProjectHandler {
    private dynamo: any;
    private ses: any;
    private cognito: any;
    private COGNITO_POOL: string;
    private user: string;
    private groups: string[];

    constructor(dynamo: any, ses: any, cognito: any, pool: string, user: string, groups: string[]) {
        this.dynamo = dynamo;
        this.ses = ses;
        this.cognito = cognito;
        this.COGNITO_POOL = pool;
        this.user = user;
        this.groups = groups;
    }

    public getById(uuid: string): Promise<any> {
        return Project.getById(uuid, this.dynamo).then((proj: Project) => {
            return proj.getParams();
        });
    }

    public getAll(): Promise<any> {
        return Project.getAll(this.dynamo).then((dbProjects: Project[]) => {
            return dbProjects.map((proj: Project) => proj.getParams());
        });
    }

    public update(uuid: string, body: any): Promise<any> {
        return Project.getById(uuid, this.dynamo).then((proj: Project) => {
            if (!this.canWrite(proj)) {
                return Promise.reject("Unauthorized");
            }

            proj.setParams(body);
            return proj.update();
        });
    }

    public remove(uuid: string): Promise<any> {
        return Project.getById(uuid, this.dynamo).then((proj: Project) => {
            if (!this.canWrite(proj)) {
                return Promise.reject("Unauthorized");
            }

            return proj.delete();
        });
    }

    public save(body: any): Promise<any> {
        body.manager = this.user;

        if (!isProjectParams(body)) {
            return Promise.reject("Invalid request");
        }

        if (!this.groups) {
            return Promise.reject("Unauthorized");
        }

        return new Project(body, this.dynamo).save().then((uuid: string) => {
            return { uuid };
        });
    }

    public async addDevelopers(uuid: string, body: any): Promise<any> {
        const proj: Project = await Project.getById(uuid, this.dynamo);
        if (!this.canWrite(proj) && (body.subs.indexOf(this.user) < 0 || body.subs.length > 1)) {
            return Promise.reject("Unauthorized");
        }

        await proj.addDevelopers(body.subs);

        let users: User[] = await User.getAll(this.cognito, this.COGNITO_POOL);
        let message: string;
        if (body.subs.length === 1 && body.subs.indexOf(this.user) > -1) {
            users = users.filter((user: User) => user.sub === proj.manager);
            message = `${users[0].name} has joined project ${proj.name}`;
        } else {
            users = users.filter((user: User) => body.subs.indexOf(user.sub) > -1);
            message = `You have been added to project ${proj.name}`;
        }

        var emailParams = {
            Destination: {
                ToAddresses: users.map((user: User) => user.email)
            },
            Message: {
                Body: {
                    Text: {
                        Charset: "UTF-8",
                        Data: message,
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "Project developers update",
                },
            },
            Source: "dmh2g16@soton.ac.uk",
        };

        return new Promise<any>((resolve, reject) => {
            this.ses.sendEmail(emailParams, (err: any, res: any) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    public removeDevelopers(uuid: string, body: any): Promise<any> {
        return Project.getById(uuid, this.dynamo).then((proj: Project) => {
            if (!this.canWrite(proj) && (body.subs.indexOf(this.user) < 0 || body.subs.length > 1)) {
                return Promise.reject("Unauthorized");
            }

            return proj.removeDevelopers(body.subs);
        });
    }

    private canWrite(proj: Project): boolean {
        if (proj.manager === this.user) {
            return true;
        }

        if (!this.groups) {
            return false;
        }

        return this.groups.indexOf("ProjectManagers") > -1 ||
            this.groups.indexOf("Admins") > -1;
    }
}

export { ProjectHandler };
