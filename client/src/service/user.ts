import axios from 'axios';

import config from '../config/config';
import CookieService from './cookie';

class UserService {
    public static getAll() {
        return axios.get(`${config.BASE_URL}/users`, CookieService.getTokenHeader());
    }
}

export default UserService;
