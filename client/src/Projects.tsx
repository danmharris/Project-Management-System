import * as React from 'react';
import { Button, FormControl, FormGroup, PageHeader } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import ProjectService from './service/project';

import ProjectList from './ProjectList';
import CookieService from './service/cookie';

interface ProjectsState {
    err: string;
    projects: any[];
    search: string;
}

class Projects extends React.Component<{}, ProjectsState> {
    constructor(props: any, context: any) {
        super(props, context);

        this.onSearchChange = this.onSearchChange.bind(this);

        this.state = {
            err: '',
            projects: [],
            search: '',
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
                <form>
                    <FormGroup controlId="form-search">
                        <FormControl type="text" value={this.state.search} onChange={this.onSearchChange} placeholder="Search..."/>
                    </FormGroup>
                </form>
                <ProjectList projects={this.state.projects.filter(proj => proj.name.toLowerCase().includes(this.state.search))} showRole={true} />
            </div>
        );
    }

    private onSearchChange(e: any) {
        this.setState({ search: e.target.value.toLowerCase() });
    }
}

export default Projects;
