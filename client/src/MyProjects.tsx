import * as React from 'react';

import { Alert, FormControl, FormGroup, PageHeader } from 'react-bootstrap';

import CookieService from './service/cookie';
import ProjectService from './service/project';

import ProjectList from './ProjectList';

interface MyProjectsState {
    manage: any[];
    develop: any[];
    search: string;
    err: string;
}

class MyProjects extends React.Component<{}, MyProjectsState> {

    constructor(props: any, context: any) {
        super(props, context);

        this.onSearchChange = this.onSearchChange.bind(this);

        this.state = {
            develop: [],
            err: '',
            manage: [],
            search: '',
        };

        ProjectService.getAll().then((res: any) => {
            const projects = res.data;
            const sub = CookieService.getSub();

            this.setState({
                develop: projects.filter((project: any) => project.developers.indexOf(sub) > -1),
                manage: projects.filter((project: any) => project.manager === sub),
            });
        }).catch((error) => this.setState({ err: `Unable to get projects. Reason: ${error.data.message}`}));
    }

    public render() {
        let alert: any;
        if (this.state.err) {
            alert = <Alert bsStyle="danger">{this.state.err}</Alert>
        }

        return (
            <div>
                {alert}
                <PageHeader>
                    My Projects
                </PageHeader>
                <form>
                    <FormGroup controlId="form-search">
                        <FormControl type="text" value={this.state.search} onChange={this.onSearchChange} placeholder="Search..." />
                    </FormGroup>
                </form>
                <ProjectList projects={this.state.manage.filter(proj => proj.name.toLowerCase().includes(this.state.search))} header="Projects I manage" />
                <ProjectList projects={this.state.develop.filter(proj => proj.name.toLowerCase().includes(this.state.search))} header="Projects I develop" />
            </div>
        );
    }


    private onSearchChange(e: any) {
        this.setState({ search: e.target.value.toLowerCase() });
    }
}

export default MyProjects;
