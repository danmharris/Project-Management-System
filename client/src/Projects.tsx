import * as React from 'react';
import { Alert, PageHeader, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import CookieService from './service/cookie';
import ProjectService from './service/project';

import './Projects.css';

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
        this.getRole = this.getRole.bind(this);
        this.onJoinClick = this.onJoinClick.bind(this);

        ProjectService.getAll().then((res: any) => {
            this.setState({ projects: res.data });
        });

    }

    public render() {
        return (
            <div>
                <PageHeader>
                    Projects
                </PageHeader>
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
                <Panel.Heading><Link to={`/projects/${project.uuid}`}>{project.name}</Link> <span id="project-role">{this.getRole(project)}</span></Panel.Heading>
                <Panel.Body>{project.description}</Panel.Body>
            </Panel>
        );
    }

    private getRole(project: any): string {
        const sub = CookieService.getSub();

        if (project.manager === sub) {
            return "Manager";
        }

        if (project.developers.indexOf(sub) > -1) {
            return "Developer";
        }

        return '';
    }

    private onJoinClick(e: any) {
        ProjectService.addDevelopers(e.target.value, [CookieService.getSub()]).then(() => {
            window.location.replace(`/projects/${e.target.value}`);
        });
    }
}

export default Projects;
