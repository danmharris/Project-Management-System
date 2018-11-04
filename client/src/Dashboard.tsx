import * as React from 'react';

import { Alert, FormControl, FormGroup, PageHeader } from 'react-bootstrap';

import CookieService from './service/cookie';
import ProjectService from './service/project';

import ProjectList from './ProjectList';

interface DashboardState {
    active: any[];
    complete: any[];
    pending: any[];
    search: string;
    err: string;
}

class Dashboard extends React.Component<{}, DashboardState> {

    constructor(props: any, context: any) {
        super(props, context);

        this.onSearchChange = this.onSearchChange.bind(this);

        this.state = {
            active: [],
            complete: [],
            err: '',
            pending: [],
            search: '',
        };

        ProjectService.getAll().then((res: any) => {
            const sub = CookieService.getSub();
            const projects = res.data.filter((project: any) => project.manager === sub || project.developers.indexOf(sub) > -1);

            this.setState({
                active: projects.filter((project: any) => +project.status === 1),
                complete: projects.filter((project: any) => +project.status === 2),
                err: '',
                pending: projects.filter((project: any) => +project.status === 0),
            });
        }).catch((error: any) => this.setState({ err: `Unable to retireve projects list. Reason: ${error.data.message}` }));
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
                    Project Status
                </PageHeader>
                <form>
                    <FormGroup controlId="form-search">
                        <FormControl type="text" value={this.state.search} onChange={this.onSearchChange} placeholder="Search..." />
                    </FormGroup>
                </form>
                <ProjectList projects={this.state.active.filter(proj => proj.name.toLowerCase().includes(this.state.search))} header="Active" />
                <ProjectList projects={this.state.pending.filter(proj => proj.name.toLowerCase().includes(this.state.search))} header="Pending" />
                <ProjectList projects={this.state.complete.filter(proj => proj.name.toLowerCase().includes(this.state.search))} header="Complete" />
            </div>
        );
    }

    private onSearchChange(e: any) {
        this.setState({ search: e.target.value.toLowerCase() });
    }
}

export default Dashboard;
