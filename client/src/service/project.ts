import axios from 'axios';
import config from '../config/config';

class ProjectService {
    public static newProject(params: any) {
        return axios.post(`${config.BASE_URL}/projects`, params);
    }
}

export default ProjectService;
