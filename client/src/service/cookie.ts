import * as Cookies from 'js-cookie';
import * as jwt from 'jsonwebtoken';

class CookieService {
    public static getSub() {
        const token = Cookies.get('jwt');

        if (typeof token === 'string') {
            const decoded = jwt.decode(token);
            if (decoded) {
                return decoded.sub;
            }
        }

        return "Unknown User";
    }
}

export default CookieService;
