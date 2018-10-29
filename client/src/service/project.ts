import axios from 'axios';

import config from '../config/config';
import CookieService from './cookie';

class ProjectService {
    public static newProject(params: any) {
        return axios.post(`${config.BASE_URL}/projects`, params, CookieService.getTokenHeader());
    }

    public static getAll() {
        return axios.get(`${config.BASE_URL}/projects`, CookieService.getTokenHeader());
    }

    public static getByUUID(uuid: string) {
        return axios.get(`${config.BASE_URL}/projects/${uuid}`, CookieService.getTokenHeader());
    }

    public static updateProject(uuid: string, params: any) {
        return axios.put(`${config.BASE_URL}/projects/${uuid}`, params, CookieService.getTokenHeader());
    }

    public static deleteProject(uuid: string) {
        return axios.delete(`${config.BASE_URL}/projects/${uuid}`, CookieService.getTokenHeader());
    }

    public static addDevelopers(uuid: string, subs: string[]) {
        return axios.post(`${config.BASE_URL}/projects/${uuid}/developers`, {subs}, CookieService.getTokenHeader());
    }

    public static removeDevelopers(uuid: string, subs: string[]) {
        const delConfig: any = CookieService.getTokenHeader();
        delConfig.data = {subs};

        return axios.delete(`${config.BASE_URL}/projects/${uuid}/developers`, delConfig);
    }

}

export default ProjectService;
