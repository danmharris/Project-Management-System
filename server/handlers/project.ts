import { isProjectParams, Project } from "../models/project";
import { User } from "../models/user";

import APIError from "../error";

/**
 * Handler functions for any operation to be performed on Projects (either individual or collection)
 */
class ProjectHandler {
    private dynamo: any;
    private ses: any;
    private cognito: any;
    private COGNITO_POOL: string;
    private user: string;
    private groups: string[];

    /**
     * When constructing provide all the classes which may be required to handle a request
     */
    constructor(dynamo: any, ses: any, cognito: any, pool: string, user: string, groups: string[]) {
        this.dynamo = dynamo;
        this.ses = ses;
        this.cognito = cognito;
        this.COGNITO_POOL = pool;
        this.user = user;
        this.groups = groups;
    }

    public async getById(uuid: string): Promise<any> {
        const project: Project = await Project.getById(uuid, this.dynamo);
        return project.getParams();
    }

    public async getAll(): Promise<any> {
        const projects: Project[] = await Project.getAll(this.dynamo);
        return projects.map((proj: Project) => proj.getParams());
    }

    public async update(uuid: string, body: any): Promise<any> {
        const project: Project = await Project.getById(uuid, this.dynamo);

        // Access Control check. If permissions not met a 403 forbidden is returned
        if (!this.canWrite(project)) {
            return Promise.reject(new APIError("You cannot update this project", 403));
        }

        project.setParams(body);
        return project.update();
    }

    public async remove(uuid: string): Promise<any> {
        const project: Project = await Project.getById(uuid, this.dynamo);

        if (!this.canWrite(project)) {
            return Promise.reject(new APIError("You cannot remove this project", 403));
        }

        return project.delete();
    }

    public async save(body: any): Promise<any> {
        body.manager = this.user;

        if (!isProjectParams(body)) {
            return Promise.reject(new APIError("Invalid request", 400));
        }

        if (!this.groups) {
            return Promise.reject(new APIError("You cannot create a project", 403));
        }

        const uuid: string = await new Project(body, this.dynamo).save();
        return { uuid };
    }

    public async addDevelopers(uuid: string, body: any): Promise<any> {
        const proj: Project = await Project.getById(uuid, this.dynamo);

        // Checks who the user can add to the project. If manager can be anyone, otherwise can only be self
        if (!this.canWrite(proj) && (body.subs.indexOf(this.user) < 0 || body.subs.length > 1)) {
            return Promise.reject(new APIError("You cannot edit developers this project", 403));
        }

        await proj.addDevelopers(body.subs);

        let users: User[] = await User.getAll(this.cognito, this.COGNITO_POOL);
        let message: string;

        // Constructs an email body based on whether the user has joined or been added.
        if (body.subs.length === 1 && body.subs.indexOf(this.user) > -1) {
            users = users.filter((user: User) => user.sub === proj.manager);
            message = `${users[0].name} has joined project ${proj.name}`;
        } else {
            users = users.filter((user: User) => body.subs.indexOf(user.sub) > -1);
            message = `You have been added to project ${proj.name}`;
        }

        const emailParams = {
            Destination: {
                ToAddresses: users.map((user: User) => user.email),
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
                    reject(new APIError("Email cannot be sent", 401));
                }
                resolve();
            });
        });
    }

    public async removeDevelopers(uuid: string, body: any): Promise<any> {
        const project: Project = await Project.getById(uuid, this.dynamo);

        if (!this.canWrite(project) && (body.subs.indexOf(this.user) < 0 || body.subs.length > 1)) {
            return Promise.reject(new APIError("You cannot edit developers this project", 403));
        }

        return project.removeDevelopers(body.subs);
    }

    /**
     * Evaluates whether the user can write to the project.
     *
     * Either has to be the project manager or in the project manager group
     */
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
