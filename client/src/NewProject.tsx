import * as React from 'react';

import EditProjectForm from './EditProjectForm';
import ProjectService from './service/project';

class NewProject extends React.Component {
    public render() {
        return (
            <EditProjectForm onSubmit={this.createProject} />
        );
    }

    private createProject(name: string, description: string) {
        return ProjectService.newProject({
            description,
            name,
        }).then((res: any) => {
            const uuid = res.data.uuid;
            window.location.replace(`/projects/${uuid}`);
        });
    }
}

export default NewProject;
