import axios from 'axios';

import config from '../config/config';
import CookieService from './cookie';

class UserService {
    public static getAll() {
        return axios.get(`${config.BASE_URL}/users`, CookieService.getTokenHeader());
    }

    public static getSkills(sub: string) {
        return axios.get(`${config.BASE_URL}/users/${sub}`, CookieService.getTokenHeader());
    }

    public static updateSkills(sub: string, skills: string[]) {
        return axios.post(`${config.BASE_URL}/users/${sub}`, {skills}, CookieService.getTokenHeader());
    }

    public static getGroup(username: string) {
        return axios.get(`${config.BASE_URL}/user_groups/${username}`, CookieService.getTokenHeader());
    }

    public static setGroup(username: string, group: string) {
        return axios.post(`${config.BASE_URL}/user_groups/${username}`, {group}, CookieService.getTokenHeader());
    }
}

export default UserService;
