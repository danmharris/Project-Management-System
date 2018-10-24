interface UserParams {
    sub: string;
    name: string;
    email: string;
    address: string;
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

    private _sub: string = "";
    private _name: string = "";
    private _email: string = "";
    private _address: string = "";

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

    public getParams(): UserParams {
        return {
            address: this.address,
            email: this.email,
            name: this.name,
            sub: this.sub,
        };
    }
}

export { User, UserParams };
