import * as React from 'react';
import { Alert, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import ProjectService from './service/project';

interface ProjectsState {
    err: string,
    projects: any[],
}

class Projects extends React.Component<{}, ProjectsState> {
    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            err: '',
            projects: [],
        };

        this.generateProjectList = this.generateProjectList.bind(this);

        ProjectService.getAll().then((res: any) => {
            this.setState({ projects: res.data });
        });

    }

    public render() {
        return (
            <div>
                {this.generateProjectList()}
            </div>
        );
    }

    private generateProjectList() {
        if (this.state.projects.length === 0) {
            return <Alert bsStyle="info">There are no projects currently. Create one?</Alert>
        }

        return this.state.projects.map((project: any) =>
            <Panel key="projects-panel">
                <Panel.Heading><Link to={`/projects/${project.uuid}`}>{project.name}</Link></Panel.Heading>
                <Panel.Body>{project.description}</Panel.Body>
            </Panel>
        );
    }
}

export default Projects;
