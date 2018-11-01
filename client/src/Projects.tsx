import * as React from 'react';
import { Button, PageHeader } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import ProjectService from './service/project';

import ProjectList from './ProjectList';
import CookieService from './service/cookie';

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

        ProjectService.getAll().then((res: any) => {
            this.setState({ projects: res.data });
        });

    }

    public render() {
        let createButton: any = null;
        const groups = CookieService.getGroups();

        if (groups.indexOf("ProjectManagers") > -1 || groups.indexOf("Admins") > -1) {
            createButton = <Link to="/new_project"><Button bsClass="float-right">Create</Button></Link>;
        }

        return (
            <div>
                {createButton}
                <PageHeader>
                    Projects
                </PageHeader>
                <ProjectList projects={this.state.projects} showRole={true} />
            </div>
        );
    }
}

export default Projects;
