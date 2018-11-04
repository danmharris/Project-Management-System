import * as React from 'react';

import { Alert, Button, ControlLabel, FormControl, FormGroup, InputGroup } from 'react-bootstrap';

import ProjectService from './service/project';

interface EditProjectDevelopersFormProps {
    users: any[];
    developerSubs: string[];
    managerSub: string;
    uuid: string;
}

interface EditProjectDevelopersFormState {
    managerSub: string;
    developerSubs: string[];
    err: string;
}

class EditProjectDevelopersForm extends React.Component<EditProjectDevelopersFormProps, EditProjectDevelopersFormState> {
    constructor(props: any, context: any) {
        super(props, context);

        this.renderDevelopers = this.renderDevelopers.bind(this);
        this.renderOtherUsers = this.renderOtherUsers.bind(this);
        this.renderSelect = this.renderSelect.bind(this);
        this.onManagerChange = this.onManagerChange.bind(this);
        this.onManagerSubmit = this.onManagerSubmit.bind(this);
        this.onAddDeveloperClick = this.onAddDeveloperClick.bind(this);
        this.onRemoveDeveloperClick = this.onRemoveDeveloperClick.bind(this);

        this.state = {
            developerSubs: this.props.developerSubs,
            err: '',
            managerSub: this.props.managerSub,
        }

    }

    public render() {
        let alert: any;
        if (this.state.err) {
            alert = <Alert bsStyle="danger">{this.state.err}</Alert>
        }

        return (
            <div>
                {alert}
                <form>
                    <FormGroup
                        controlId='form-manager'
                    >
                        <ControlLabel>Manager</ControlLabel>
                        <FormControl componentClass="select" placeholder="manager" value={this.state.managerSub} onChange={this.onManagerChange}>
                            {this.renderSelect()}
                        </FormControl>

                        <Button onClick={this.onManagerSubmit}>Update</Button>
                    </FormGroup>
                </form>
                <form>
                    <FormGroup controlId='form-developers-remove'>
                        <ControlLabel>Developers</ControlLabel>
                        {this.renderDevelopers()}
                    </FormGroup>
                </form>
                <form>
                    <FormGroup controlId='form-developers-add'>
                        <ControlLabel>Add Developers</ControlLabel>
                        {this.renderOtherUsers()}
                    </FormGroup>
                </form>
            </div>

        );
    }

    private renderSelect() {
        return this.props.users
            .map(dev => <option key={dev.sub} value={dev.sub}>{dev.name}</option>);
    }

    private renderDevelopers() {
        const developers = this.props.users.filter((user: any) => this.state.developerSubs.indexOf(user.sub) > -1);

        return developers.map(dev =>
            <InputGroup key={dev.sub}>
                <FormControl type="text" disabled={true} value={dev.name} />
                <InputGroup.Button><Button value={dev.sub} onClick={this.onRemoveDeveloperClick}>Remove</Button></InputGroup.Button>
            </InputGroup>
        );
    }

    private renderOtherUsers() {
        const otherUsers = this.props.users.filter((user: any) => this.state.developerSubs.indexOf(user.sub) <= -1);

        return otherUsers.map(user =>
            <InputGroup key={user.sub}>
                <FormControl type="text" disabled={true} value={user.name} />
                <InputGroup.Button><Button value={user.sub} onClick={this.onAddDeveloperClick}>Add</Button></InputGroup.Button>
            </InputGroup>
        );
    }

    private onManagerChange(e: any) {
        this.setState({
            managerSub: e.target.value,
        });
    }

    private onManagerSubmit(e: any) {
        ProjectService.updateProject(this.props.uuid, {
            manager: this.state.managerSub,
        }).catch((error) => this.setState({ err: `Unable to update manager. Reason: ${error.data.message}`}));
    }

    private onAddDeveloperClick(e: any) {
        this.setState({
            developerSubs: this.state.developerSubs.concat([e.target.value]),
        });
        ProjectService.addDevelopers(this.props.uuid, [e.target.value])
            .catch((error) => this.setState({ err: `Unable to add developer. Reason: ${error.data.message}`}));
    }

    private onRemoveDeveloperClick(e: any) {
        this.setState({
            developerSubs: this.state.developerSubs.filter(sub => sub !== e.target.value),
        })
        ProjectService.removeDevelopers(this.props.uuid, [e.target.value])
            .catch((error) => this.setState({ err: `Unable to remove developer. Reason: ${error.data.message}`}));
    }
}

export default EditProjectDevelopersForm;
