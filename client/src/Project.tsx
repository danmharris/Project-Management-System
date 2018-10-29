import * as React from 'react';
import { Alert, Badge, Button, PageHeader, Panel } from 'react-bootstrap';

import EditProjectDevelopersForm from './EditProjectDevelopersForm';
import EditProjectForm from './EditProjectForm';

import CookieService from './service/cookie';
import ProjectService from './service/project';

import './Buttons.css';
import UserService from './service/user';

interface ProjectState {
    name: string;
    description: string;
    developers: string[];
    manager: string;
    err: '';
    edit: boolean;
    uuid: string;
    users: any[];
    status: number;
}

class Project extends React.Component<{}, ProjectState> {
    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            description: '',
            developers: [],
            edit: false,
            err: '',
            manager: '',
            name: '',
            status: 0,
            users: [],
            uuid: props.match.params.uuid,
        };

        this.renderEditButton = this.renderEditButton.bind(this);
        this.onEditBackClick = this.onEditBackClick.bind(this);
        this.onEditSubmit = this.onEditSubmit.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);
        this.getManager = this.getManager.bind(this);
        this.getDevelopers = this.getDevelopers.bind(this);
        this.getStatusString = this.getStatusString.bind(this);
        this.onJoinClick = this.onJoinClick.bind(this);
        this.onLeaveClick = this.onLeaveClick.bind(this);

        UserService.getAll().then((res: any) => {
            this.setState({
                users: res.data,
            });
        });

        ProjectService.getByUUID(this.state.uuid).then((res: any) => {
            this.setState({
                description: res.data.description,
                developers: res.data.developers,
                manager: res.data.manager,
                name: res.data.name,
                status: +res.data.status,
            });
        });

    }

    public render() {
        if (this.state.edit) {
            return (
                <div>
                    <Button bsClass="float-right" onClick={this.onEditBackClick}>Back</Button>
                    <Button bsClass="float-right" onClick={this.onDeleteClick}>Delete</Button>
                    <EditProjectForm onSubmit={this.onEditSubmit} name={this.state.name} description={this.state.description} status={this.state.status}/>
                    <EditProjectDevelopersForm users={this.state.users} developerSubs={this.state.developers} managerSub={this.state.manager} uuid={this.state.uuid}/>
                </div>
            );
        } else {
            return (
                <div>
                    {this.renderEditButton()}
                    <PageHeader>{this.state.name} <Badge>{this.state.developers.length + 1}</Badge> <Badge>{this.getStatusString()}</Badge></PageHeader>
                    <Panel><Panel.Body>{this.state.description}</Panel.Body></Panel>
                    <h4>Manager: {this.getManager()}</h4>
                    <h4>Developers:</h4>
                    <ul>
                        {this.getDevelopers()}
                    </ul>
                </div>
            );
        }
    }

    private onEditBackClick() {
        this.setState({ edit: !this.state.edit });
    }

    private renderEditButton() {
        const sub = CookieService.getSub();
        if (sub === this.state.manager) {
            return <Button bsClass="float-right" onClick={this.onEditBackClick}>Edit</Button>
        } else if (this.state.developers.indexOf(sub) > -1) {
            return <Button bsClass="float-right" onClick={this.onLeaveClick}>Leave</Button>;
        } else {
            return <Button bsClass="float-right" onClick={this.onJoinClick}>Join</Button>
        }
    }

    private onEditSubmit(name: string, description: string, status: number) {
        return ProjectService.updateProject(this.state.uuid, {
            description,
            name,
            status,
        }).then(() => this.setState({
            description,
            name,
            status,
        }));
    }

    private onDeleteClick() {
        ProjectService.deleteProject(this.state.uuid).then(() => window.location.replace('/projects'));
    }

    private getManager() {
        if (this.state.manager && this.state.users.length > 0) {
            return this.state.users.find((user: any) => user.sub === this.state.manager).name;
        } else {
            return "No Manager";
        }
    }

    private getDevelopers() {
        if (this.state.developers.length === 0) {
            return <Alert bsStyle="info">There aren't any developers on this project</Alert>
        }

        return this.state.users.filter((user: any) => this.state.developers.indexOf(user.sub) > -1)
            .map((dev: any) =>
                <li key={dev.sub}>{dev.name}</li>
            );
    }

    private getStatusString() {
        switch(this.state.status) {
            case 0:
                return "Pending";
            case 1:
                return "Active";
            case 2:
                return "Complete";
            default:
                return "Unknown";
        }
    }

    private onJoinClick() {
        ProjectService.addDevelopers(this.state.uuid, [CookieService.getSub()]);
    }

    private onLeaveClick() {
        ProjectService.removeDevelopers(this.state.uuid, [CookieService.getSub()]);
    }
}

export default Project;
