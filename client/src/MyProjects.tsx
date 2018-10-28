import * as React from 'react';

import { PageHeader, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import CookieService from './service/cookie';
import ProjectService from './service/project';

interface MyProjectsState {
    manage: any[];
    develop: any[];
}

class MyProjects extends React.Component<{}, MyProjectsState> {

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            develop: [],
            manage: [],
        };

        ProjectService.getAll().then((res: any) => {
            const projects = res.data;
            const sub = CookieService.getSub();

            this.setState({
                develop: projects.filter((project: any) => project.developers.indexOf(sub) > -1),
                manage: projects.filter((project: any) => project.manager === sub),
            });
        });
    }

    public render() {
        return (
            <div>
                <PageHeader>
                    My Projects
                </PageHeader>
                <h4>Projects I manage</h4>
                {this.renderProjects(this.state.manage)}
                <h4>Projects I develop</h4>
                {this.renderProjects(this.state.develop)}
            </div>
        );
    }

    private renderProjects(projects: any[]) {
        return projects.map((project: any) =>
            <Panel key="projects-panel">
                <Panel.Heading><Link to={`/projects/${project.uuid}`}>{project.name}</Link></Panel.Heading>
                <Panel.Body>{project.description}</Panel.Body>
            </Panel>
        );
    }
}

export default MyProjects;
