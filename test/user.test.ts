import * as expect from 'expect';
import * as sinon from 'sinon';
import * as AWS from 'aws-sdk';
import { describe, it } from 'mocha';
import { User, UserParams } from '../user';

describe('User', function() {
    let params: UserParams;
    let dbh: any;
    let user: User;

    beforeEach(function() {
        params = {
            sub: 'abc123',
            name: 'Joe Bloggs',
            skills: ['TypeScript', 'AWS'],
        };
        dbh = new AWS.DynamoDB.DocumentClient();
        user = new User(params, dbh);
    });

    describe('getting user by id', function() {
        it('should return correct values', function() {
            const getStub = sinon.stub(dbh, 'get').callsFake((req, next) => {
                next(null, {
                    Item: params
                });
            });

            return User.getById('abc123', dbh).then((user: User) => {
                expect(getStub.called);
                expect(user.sub).toEqual('abc123');
                expect(user.name).toEqual('Joe Bloggs');
                expect(user.skills).toContain('TypeScript');
                expect(user.skills).toContain('AWS');
            });
        });

        it('should return error on database failure', function() {
            const getFailStub = sinon.stub(dbh, 'get').callsFake((req, next) => {
                next('err', null);
            });

            return User.getById('abc123', dbh).catch((err: string) => {
                expect(getFailStub.called);
                expect(err).toEqual("Unable to retrieve user");
            });
        });
    });

    describe('getting all', function() {
        it('should return correct values', function() {
            const getAllStub = sinon.stub(dbh, 'scan').callsFake((req, next) => {
                next(null, {
                    Items: [
                        {
                            sub: '123',
                            name: 'a',
                            skills: ['TypeScript'],
                        },
                        {
                            sub: '456',
                            name: 'b',
                            skills: ['AWS'],
                        },
                    ]
                });
            });

            return User.getAll(dbh).then((users: User[]) => {
                expect(getAllStub.called);
                expect(users.length).toEqual(2);
                expect(users[0].sub).toEqual('123');
                expect(users[1].sub).toEqual('456');
            });
        });

        it('should return an error on database error', function() {
            const getAllFailStub = sinon.stub(dbh, 'scan').callsFake((req, next) => {
                next('err', null);
            });

            return User.getAll(dbh).catch((err: string) => {
                expect(getAllFailStub.called);
                expect(err).toEqual('Unable to retrieve users');
            });
        });
    });

    describe('saving', function() {

        it('should return uuid if success', function() {
            const saveStub = sinon.stub(dbh, 'put').callsFake((req, next) => {
                next(null, 'saved');
            });
    
            user.save().then((sub: string) => {
                expect(saveStub.called);
                expect(sub).toEqual('abc123');
            });
        });
        
        it('should return error if failure', function() {
            const failSaveStub = sinon.stub(dbh, 'put').callsFake((req, next) => {
                next('err', null);
            });

            user.save().catch((err: string) => {
                expect(failSaveStub.called);
                expect(err).toEqual('Error saving user');
            });
        })
    });

    describe('udating', function() {
        it('should resolve if successful', function() {
            const updateStub = sinon.stub(dbh, 'update').callsFake((req, next) => {
                next(null, 'updated');
            });

            user.update().then(() => {
                expect(updateStub.called);
            });
        });

        it('should return error if database failure', function() {
            const failUpdateStub = sinon.stub(dbh, 'update').callsFake((req, next) => {
                next('err', null);
            });

            user.update().catch((err: string) => {
                expect(failUpdateStub.called);
                expect(err).toEqual('Unable to update user');
            });
        });
    });

    describe('constructor', function() {
        it('should set all parameters', function() {
            expect(user.sub).toEqual('abc123');
            expect(user.name).toEqual('Joe Bloggs');
            expect(user.skills.length).toEqual(2);
            expect(user.skills).toContain('TypeScript');
            expect(user.skills).toContain('AWS');
        });
    });

    describe('get/set params', function() {
        it('should return all params', function() {
            const params: UserParams = user.getParams();

            expect(params.sub).toEqual(user.sub);
            expect(params.name).toEqual(user.name);
            expect(params.skills).toEqual(user.skills);
        });

        it('should update name if provided', function() {
            user.setParams({name: 'John Smith'});
            expect(user.name).toEqual('John Smith');
        });

        it('should update skills if provided', function() {
            user.setParams({skills: ['test']});
            expect(user.skills).toEqual(['test']);
        });

        it('should not update sub', function() {
            user.setParams({sub: '123'});
            expect(user.sub).toEqual('abc123');
        });
    });
});