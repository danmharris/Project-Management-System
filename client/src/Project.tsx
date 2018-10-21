import * as React from 'react';
import { Badge, Button, PageHeader } from 'react-bootstrap';

import CookieService from './service/cookie';
import ProjectService from './service/project';

import './Project.css';

interface ProjectState {
    name: string;
    description: string;
    developers: string[];
    manager: string;
    err: '';
}

class Project extends React.Component<{}, ProjectState> {
    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            description: '',
            developers: [],
            err: '',
            manager: '',
            name: '',
        };

        this.renderDeveloperList = this.renderDeveloperList.bind(this);
        this.renderEditButton = this.renderEditButton.bind(this);

        ProjectService.getByUUID(props.match.params.uuid).then((res: any) => {
            this.setState({
                description: res.data.description,
                developers: res.data.developers,
                manager: res.data.manager,
                name: res.data.name,
            });
        });

    }

    public render() {
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

    private renderEditButton() {
        if (CookieService.getSub() === this.state.manager) {
            return <Button id="edit-button">Edit</Button>
        } else {
            return null;
        }
    }

    private renderDeveloperList() {
        return this.state.developers.map(dev =>
            <li key={dev}>{dev}</li>
        );
    }
}

export default Project;
