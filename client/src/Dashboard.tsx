import * as React from 'react';

import { PageHeader } from 'react-bootstrap';

import CookieService from './service/cookie';
import ProjectService from './service/project';

import ProjectList from './ProjectList';

interface DashboardState {
    active: any[];
    complete: any[];
    pending: any[];
}

class Dashboard extends React.Component<{}, DashboardState> {

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            active: [],
            complete: [],
            pending: [],
        };

        ProjectService.getAll().then((res: any) => {
            const sub = CookieService.getSub();
            const projects = res.data.filter((project: any) => project.manager === sub || project.developers.indexOf(sub) > -1);

            this.setState({
                active: projects.filter((project: any) => +project.status === 1),
                complete: projects.filter((project: any) => +project.status === 2),
                pending: projects.filter((project: any) => +project.status === 0),
            });
        });
    }

    public render() {
        return (
            <div>
                <PageHeader>
                    Project Status
                </PageHeader>
                <ProjectList projects={this.state.active} header="Active" />
                <ProjectList projects={this.state.pending} header="Pending" />
                <ProjectList projects={this.state.complete} header="Complete" />
            </div>
        );
    }
}

export default Dashboard;
