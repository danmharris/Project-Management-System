interface UserParams {
    sub: string;
    name: string;
    email: string;
    address: string;
    username: string;
}

class User {
    public static getAll(cognito: any, poolId: string): Promise<User[]> {
        const params = {
            UserPoolId: poolId,
            AttributesToGet: [
                "sub",
                "name",
                "email",
                "address",
            ],
        };

        return new Promise((resolve, reject) => {
            cognito.listUsers(params, (err: any, res: any) => {
                if (err) {
                    reject("Unable to retrieve users");
                } else {
                    resolve(res.Users.map((cognitoUser: any) => {
                        const user: User = new User();
                        user._username = cognitoUser.Username;
                        for (const attrib of cognitoUser.Attributes) {
                            switch (attrib.Name) {
                                case "sub":
                                    user._sub = attrib.Value;
                                    break;
                                case "name":
                                    user._name = attrib.Value;
                                    break;
                                case "email":
                                    user._email = attrib.Value;
                                    break;
                                case "address":
                                    user._address = attrib.Value;
                                    break;
                            }
                        }
                        return user;
                    }));
                }
            });
        });
    }

    public static getGroup(username: string, cognito: any, poolId: string): Promise<string> {
        const params = {
            UserPoolId: poolId,
            Username: username,
        };

        return new Promise((resolve, reject) => {
            cognito.adminListGroupsForUser(params, (err: any, res: any) => {
                if (err) {
                    reject("Unable to get groups");
                } else {
                    if (res.Groups.length > 0) {
                        resolve(res.Groups[0].GroupName);
                    }

                    resolve("Developers");
                }
            });
        });
    }

    public static setGroup(username: string, cognito: any, poolId: string, group: string): Promise<any> {
        return this.getGroup(username, cognito, poolId).then((oldGroup: string) => {
            if (oldGroup === "Developers") {
                return Promise.resolve(null);
            }

            const removeParams = {
                GroupName: oldGroup,
                UserPoolId: poolId,
                Username: username,
            };

            return new Promise((resolve, reject) => {
                cognito.adminRemoveUserFromGroup(removeParams, (err: any, res: any) => {
                    if (err) {
                        reject("Unable to remove old group");
                    } else {
                        resolve();
                    }
                });
            });
        }).then(() => {
            if(group === "Developers") {
                return Promise.resolve({});
            }

            const addParams = {
                GroupName: group,
                UserPoolId: poolId,
                Username: username,
            };

            return new Promise((resolve, reject) => {
                cognito.adminAddUserToGroup(addParams, (err: any, res: any) => {
                    if (err) {
                        reject("Unable to add new group");
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    private _sub: string = "";
    private _name: string = "";
    private _email: string = "";
    private _address: string = "";
    private _username: string = "";

    get sub() {
        return this._sub;
    }

    get name() {
        return this._name;
    }

    get email() {
        return this._email;
    }

    get address() {
        return this._address;
    }

    get username() {
        return this._username;
    }

    public getParams(): UserParams {
        return {
            address: this.address,
            email: this.email,
            name: this.name,
            sub: this.sub,
            username: this.username,
        };
    }
}

export { User, UserParams };
