import * as React from 'react';
import { Badge, Button, PageHeader, Panel } from 'react-bootstrap';

import EditProjectDevelopersForm from './EditProjectDevelopersForm';
import EditProjectForm from './EditProjectForm';

import CookieService from './service/cookie';
import ProjectService from './service/project';

import './Project.css';
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
            users: [],
            uuid: props.match.params.uuid,
        };

        this.renderEditButton = this.renderEditButton.bind(this);
        this.onEditBackClick = this.onEditBackClick.bind(this);
        this.onEditSubmit = this.onEditSubmit.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);
        this.getManager = this.getManager.bind(this);
        this.getDevelopers = this.getDevelopers.bind(this);

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
            });
        });

    }

    public render() {
        if (this.state.edit) {
            return (
                <div>
                    <Button id="edit-button" onClick={this.onEditBackClick}>Back</Button>
                    <Button id="edit-button" onClick={this.onDeleteClick}>Delete</Button>
                    <EditProjectForm onSubmit={this.onEditSubmit} name={this.state.name} description={this.state.description}/>
                    <EditProjectDevelopersForm users={this.state.users} developerSubs={this.state.developers} managerSub={this.state.manager} uuid={this.state.uuid}/>
                </div>
            );
        } else {
            return (
                <div>
                    {this.renderEditButton()}
                    <PageHeader>{this.state.name} <Badge>{this.state.developers.length + 1}</Badge></PageHeader>
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
        if (CookieService.getSub() === this.state.manager) {
            return <Button id="edit-button" onClick={this.onEditBackClick}>Edit</Button>
        } else {
            return null;
        }
    }

    private onEditSubmit(name: string, description: string) {
        return ProjectService.updateProject(this.state.uuid, {
            description,
            name,
        }).then(() => this.setState({
            description,
            name,
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
        return this.state.users.filter((user: any) => this.state.developers.indexOf(user.sub) > -1)
            .map((dev: any) =>
                <li key={dev.sub}>{dev.name}</li>
            );
    }
}

export default Project;
