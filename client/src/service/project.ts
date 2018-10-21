import axios from 'axios';
import * as Cookies from 'js-cookie';

import config from '../config/config';

class ProjectService {
    public static newProject(params: any) {
        return axios.post(`${config.BASE_URL}/projects`, params, this.getTokenHeader());
    }

    public static getAll() {
        return axios.get(`${config.BASE_URL}/projects`, this.getTokenHeader());
    }

    public static getByUUID(uuid: string) {
        return axios.get(`${config.BASE_URL}/projects/${uuid}`, this.getTokenHeader());
    }

    private static getTokenHeader() {
        return {
            headers: {
                Authorization: Cookies.get('jwt'),
            }
        };
    }
}

export default ProjectService;
