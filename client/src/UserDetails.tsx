import * as React from 'react';

import { Alert, Button, ControlLabel, FormControl, FormGroup, Modal } from 'react-bootstrap';

import CookieService from './service/cookie';
import UserService from './service/user';

interface UserDetailsProps {
    user: any;
    onModalHide: () => void;
}

interface UserDetailsState {
    group: string;
    err: string;
    skills: string[];
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
            group: '',
            skills: [],
        };

        UserService.getSkills(this.props.user.sub).then((res: any) => {
            this.setState({
                skills: res.data.skills,
            });
        }).catch((error) => this.setState({ err: `Unable to get user information. Reason: ${error.data.message}`}));;

        const isAdmin = CookieService.getGroups().indexOf("Admins") > -1;
        if (isAdmin) {
            UserService.getGroup(this.props.user.username).then((res: any) => {
                this.setState({
                    group: res.data.group,
                });
            }).catch((error) => this.setState({ err: `Unable to get group information. Reason: ${error.data.message}`}));;
        }
    }

    public render() {
        let alert: any;
        if (this.state.err) {
            alert = <Alert bsStyle="danger">{this.state.err}</Alert>
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
        if (this.state.skills.length === 0) {
            return <Alert bsStyle="info">This user has no skills listed</Alert>
        }

        return this.state.skills.map((skill: string) =>
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
        UserService.setGroup(this.props.user.username, this.state.group)
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
