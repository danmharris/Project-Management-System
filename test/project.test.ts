import * as expect from 'expect';
import * as sinon from 'sinon';
import * as AWS from 'aws-sdk';
import { describe, it } from 'mocha';
import { Project } from '../project';

describe('Project', function() {
    describe('getting from database by id', function() {
        let dbh: any;

        beforeEach(function() {
            dbh= new AWS.DynamoDB.DocumentClient();
        });

        it('should return correct values', function() {
            const getStub = sinon.stub(dbh, "get").callsFake((params: any, next: any) => {
                next(null, {
                    Item: {
                        uuid: '123',
                        name: "A project",
                        description: "Project description"
                    }
                })
            });

            return Project.getById("123", dbh).then((proj: Project) => {
                expect(getStub.called);
                expect(proj.uuid).toBe("123");
                expect(proj.name).toBe("A project");
                expect(proj.description).toBe("Project description");
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
    })
});
