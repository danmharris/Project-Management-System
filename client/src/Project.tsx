import * as React from 'react';
import { Badge, Button, PageHeader } from 'react-bootstrap';

import EditProjectForm from './EditProjectForm';

import CookieService from './service/cookie';
import ProjectService from './service/project';

import './Project.css';

interface ProjectState {
    name: string;
    description: string;
    developers: string[];
    manager: string;
    err: '';
    edit: boolean;
    uuid: string;
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
            uuid: props.match.params.uuid,
        };

        this.renderDeveloperList = this.renderDeveloperList.bind(this);
        this.renderEditButton = this.renderEditButton.bind(this);
        this.onEditBackClick = this.onEditBackClick.bind(this);
        this.onEditSubmit = this.onEditSubmit.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);

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
                </div>
            );
        } else {
            return (
                <div>
                    {this.renderEditButton()}
                    <PageHeader>{this.state.name} <Badge>{this.state.developers.length + 1}</Badge></PageHeader>
                    <h4>Manager: {this.state.manager}</h4>
                    <p>{this.state.description}</p>
                    <ul>
                        {this.renderDeveloperList()}
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

    private renderDeveloperList() {
        return this.state.developers.map(dev =>
            <li key={dev}>{dev}</li>
        );
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
}

export default Project;
