import * as React from 'react';

import { PageHeader } from 'react-bootstrap';

import CookieService from './service/cookie';
import ProjectService from './service/project';

import ProjectList from './ProjectList';

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
                <ProjectList projects={this.state.manage} header="Projects I manage" />
                <ProjectList projects={this.state.develop} header="Projects I develop" />
            </div>
        );
    }
}

export default MyProjects;
