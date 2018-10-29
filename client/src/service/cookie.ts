import * as Cookies from 'js-cookie';
import * as jwt from 'jsonwebtoken';

class CookieService {
    public static getTokenHeader() {
        return {
            headers: {
                Authorization: Cookies.get('jwt'),
            }
        };
    }

    public static getSub() {
        const payload: any = this.decode();

        if (payload) {
            return payload.sub;
        }

        return "Unknown User";
    }

    public static getName() {
        const payload: any = this.decode();
        if (payload) {
            return payload.name;
        }

        return "Unknown User";
    }

    public static getGroups() {
        const payload: any = this.decode();
        if (payload) {
            const groups = payload["cognito:groups"];
            return groups ? groups : [];
        }
    }

    public static isExpired() {
        const now = Math.round(new Date().getTime() / 1000);
        const payload: any = this.decode();

        if (payload) {
            return payload.exp < now;
        }

        return true;
    }

    public static clear() {
        Cookies.remove('jwt');
    }

    private static decode() {
        const token = Cookies.get('jwt');

        if (typeof token === 'string') {
            return jwt.decode(token);
        }

        return null;
    }

}

export default CookieService;
