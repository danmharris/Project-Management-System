import * as expect from 'expect';
import * as sinon from 'sinon';
import * as AWS from 'aws-sdk';
import { describe, it } from 'mocha';
import { Project, ProjectParams, ProjectStatus, isProjectParams } from '../project';

describe('Project', function() {
    let params: ProjectParams;
    let dbh: any;
    let proj: Project;

    beforeEach(function() {
        params = {
            name: 'name',
            description: 'description',
        };
        dbh = new AWS.DynamoDB.DocumentClient();
        proj = new Project(params, dbh);
    });

    describe('getting from database by id', function() {
        it('should return correct values', function() {
            const getStub = sinon.stub(dbh, "get").callsFake((params: any, next: any) => {
                next(null, {
                    Item: {
                        uuid: '123',
                        name: 'A project',
                        description: 'Project description',
                        status: 1,
                    }
                })
            });

            return Project.getById("123", dbh).then((proj: Project) => {
                expect(getStub.called);
                expect(proj.uuid).toBe("123");
                expect(proj.name).toBe("A project");
                expect(proj.description).toBe("Project description");
                expect(proj.status).toBe(ProjectStatus.ACTIVE);
            });
        });

        it('should return an error if API fails', function() {
            const getFailStub = sinon.stub(dbh, "get").callsFake((params: any, next: any) => {
                next("error", null);
            });

            return Project.getById("123", dbh).catch((err: any) => {
                expect(getFailStub.called);
                expect(err).toBe("Unable to retrieve project");
            });
        })
    });

    describe('getting all', function() {
        it('should return correct values', function() {
            const scanStub = sinon.stub(dbh, "scan").callsFake((params: any, next: any) => {
                next(null, {
                    Items: [
                        {
                            uuid: '123',
                            name: 'A project',
                            description: 'Project description',
                            status: 1,
                        },
                        {
                            uuid: '456',
                            name: 'Another Project',
                            description: 'Project description 2',
                            status: 1,
                        }
                    ]
                })
            });

            return Project.getAll(dbh).then((projects: Project[]) => {
                expect(scanStub.called);
                expect(projects.length).toEqual(2);
                expect(projects[0].uuid).toEqual('123');
                expect(projects[1].uuid).toEqual('456');
            });
        });

        it('should return an error if API fails', function() {
            const scanFailStub = sinon.stub(dbh, "scan").callsFake((params: any, next: any) => {
                next("error", null);
            });

            return Project.getAll(dbh).catch((err: any) => {
                expect(scanFailStub.called);
                expect(err).toBe("Unable to retrieve projects");
            });
        });
    });

    describe('Constructor', function() {

        it('should set properties based on parameters', function() {
            expect(proj.name).toEqual('name');
            expect(proj.description).toEqual('description');
        });

        it('should set the UUID if provided', function() {
            params.uuid = '123';

            proj = new Project(params, null);
            expect(proj.uuid).toEqual('123');
        });

        it('should generate a uuid if not provided', function() {
            expect(proj.uuid).toBeTruthy();
        });

        it('should set the status if provided', function() {
            params.status = ProjectStatus.DONE;
            proj = new Project(params, null);
            expect(proj.status).toEqual(ProjectStatus.DONE);
        });

        it('should set status to PENDING if not provided', function() {
            expect(proj.status).toEqual(ProjectStatus.PENDING);
        });
    });

    describe('Setters', function() {
        it('should set correct values for individual fields', function() {
            proj.name = 'new name';
            expect(proj.name).toEqual('new name');
            proj.description = 'new description';
            expect(proj.description).toEqual('new description');
            proj.status = ProjectStatus.DONE;
            expect(proj.status).toEqual(ProjectStatus.DONE);
        });
    });

    describe('get/set params', function() {
        it('should update the name if provided', function() {
            const newParams = {
                name: 'new name',
            }

            proj.setParams(newParams);

            expect(proj.name).toEqual('new name');
        });

        it('should update the description if provided', function() {
            const newParams = {
                description: 'new description',
            }

            proj.setParams(newParams);

            expect(proj.description).toEqual('new description');
        });

        it('should update the status if provided', function() {
            const newParams = {
                status: ProjectStatus.DONE,
            }

            proj.setParams(newParams);

            expect(proj.status).toEqual(ProjectStatus.DONE);
        });

        it('should update combinations of fields', function() {
            const newParams = {
                name: 'new name',
                description: 'new description',
                status: ProjectStatus.DONE,
            }

            proj.setParams(newParams);

            expect(proj.name).toEqual('new name');
            expect(proj.description).toEqual('new description');
            expect(proj.status).toEqual(ProjectStatus.DONE);
        });

        it('should return all parameters', function() {
            params.uuid = '123';
            params.status = ProjectStatus.DONE;
            proj = new Project(params, null);

            const retrievedParams: ProjectParams = proj.getParams();

            expect(retrievedParams.uuid).toEqual('123');
            expect(retrievedParams.name).toEqual('name');
            expect(retrievedParams.description).toEqual('description');
            expect(retrievedParams.status).toEqual(ProjectStatus.DONE);
        })
    });

    describe('save', function() {
        it('should return the uuid if successful', function() {
            const saveStub = sinon.stub(dbh, 'put').callsFake((params: any, next: any) => {
                next(null, 'saved');
            });

            proj.save().then((uuid: string) => {
                expect(saveStub.called);
                expect(uuid).toEqual(proj.uuid);
            });
        });

        it('should return an error if database unsuccessful', function() {
            const failSaveStub = sinon.stub(dbh, 'put').callsFake((params: any, next: any) => {
                next('err', null);
            });

            proj.save().catch((err: string) => {
                expect(failSaveStub.called);
                expect(err).toEqual('Error creating project');
            });
        });
    });

    describe('update', function() {
        it('should resolve if successful', function() {
            const updateStub = sinon.stub(dbh, 'update').callsFake((params: any, next: any) => {
                next(null, 'saved');
            });

            proj.update().then((res: any) => {
                expect(updateStub.called);
            });
        });

        it('should return an error if database unsuccessful', function() {
            const failUpdateStub = sinon.stub(dbh, 'update').callsFake((params: any, next: any) => {
                next('err', null);
            });

            proj.update().catch((err: string) => {
                expect(failUpdateStub.called);
                expect(err).toEqual('Unable to update project');
            });
        });
    });

    describe('delete', function() {
        it('should resolve if successful', function() {
            const deleteStub = sinon.stub(dbh, 'delete').callsFake((params: any, next: any) => {
                next(null, 'saved');
            });

            proj.delete().then((res: any) => {
                expect(deleteStub.called);
            });
        });

        it('should return an error if database unsuccessful', function() {
            const failDeleteStub = sinon.stub(dbh, 'delete').callsFake((params: any, next: any) => {
                next('err', null);
            });

            proj.delete().catch((err: string) => {
                expect(failDeleteStub.called);
                expect(err).toEqual('Unable to delete project');
            });
        });
    });

    describe('isProjectParams', function() {
        let params: any;

        beforeEach(function() {
            params = {
                name: 'name',
                description: 'description',
                uuid: '123',
                status: 2,
            }
        });

        it('should return true when required properties provided', function() {
            const res = isProjectParams(params);
            expect(res).toBeTruthy();
        });

        it('should return false if required parameter missing', function() {
            let res = isProjectParams({name: 'name'});
            expect(res).toBeFalsy();

            res = isProjectParams(({description: 'description'}));
            expect(res).toBeFalsy();
        });

        it('should return an error if name type is wrong', function() {
            params.name = 2;
            const res = isProjectParams(params);
            expect(res).toBeFalsy();
        });

        it('should return an error if description type is wrong', function() {
            params.description = 2;
            const res = isProjectParams(params);
            expect(res).toBeFalsy();
        });

        it('should return an error if uuid type is wrong', function() {
            params.uuid = 2;
            const res = isProjectParams(params);
            expect(res).toBeFalsy();
        });

        it('should return an error if status type is wrong', function() {
            params.status = "2";
            const res = isProjectParams(params);
            expect(res).toBeFalsy();
        });

        it('should return an error if status range is wrong', function() {
            params.status = -1;
            let res = isProjectParams(params);
            expect(res).toBeFalsy();

            params.status = 3;
            res = isProjectParams(params);
            expect(res).toBeFalsy();
        });
    });
});
