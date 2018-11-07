import * as React from 'react';

import { Alert, Button, ControlLabel, FormControl, FormGroup, Modal } from 'react-bootstrap';

import UserService from './service/user';

interface UserDetailsProps {
    user: any;
    skills: string[];
    group: string;
    onModalHide: () => void;
}

interface UserDetailsState {
    group: string;
    err: string;
}

class UserDetails extends React.Component<UserDetailsProps, UserDetailsState> {

    constructor(props: any, context: any) {
        super(props, context);

        this.renderSkillsList = this.renderSkillsList.bind(this);
        this.renderGroupList = this.renderGroupList.bind(this);
        this.onGroupChange = this.onGroupChange.bind(this);
        this.onModalHide = this.onModalHide.bind(this);
        this.onGroupSubmit = this.onGroupSubmit.bind(this);

        this.state = {
            err: '',
            group: this.props.group,
        };
    }

    public render() {
        let alert: any;
        if (this.state.err) {
            alert = <Alert bsStyle="danger">{this.state.err}</Alert>
        }

        if (!this.props.user) {
            return null;
        }

        return (
            <Modal  show={true}
                    onHide={this.onModalHide}>
                    {alert}

                    <Modal.Header closeButton={true}>
                        <Modal.Title>{this.props.user.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5>Email: {this.props.user.email}</h5>
                        <h5>Address: {this.props.user.address}</h5>
                        <h4>Skills:</h4>
                        <ul>
                            {this.renderSkillsList()}
                        </ul>
                        {this.renderGroupList()}
                    </Modal.Body>
                </Modal>
        )
    }

    private renderSkillsList() {
        if (this.props.skills.length === 0) {
            return <Alert bsStyle="info">This user has no skills listed</Alert>
        }

        return this.props.skills.map((skill: string) =>
            <li key={skill}>
                {skill}
            </li>
        );
    }

    private renderGroupList() {
        if (this.state.group === '') {
            return null;
        }

        return (
            <form>
                <FormGroup controlId="user-group">
                    <ControlLabel>Group:</ControlLabel>
                    <FormControl componentClass="select" value={this.state.group} onChange={this.onGroupChange}>
                        <option value="Developers">Developers</option>
                        <option value="ProjectManagers">Project Managers</option>
                        <option value="Admins">Admins</option>
                    </FormControl>
                    <Button onClick={this.onGroupSubmit}>Update</Button>
                </FormGroup>
            </form>
        );
    }

    private onGroupChange(e: any) {
        this.setState({
            group: e.target.value,
        });
    }

    private onGroupSubmit() {
        UserService.setGroup(this.props.user.username, this.props.group)
            .catch((error) => this.setState({ err: `Unable to update group. Reason: ${error.data.message}`}));;
    }

    private onModalHide() {
        this.setState({
            err: '',
            group: '',
        })
        this.props.onModalHide();
    }
}

export default UserDetails;
