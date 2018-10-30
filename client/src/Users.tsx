import * as React from 'react';

import { Alert, Button, ControlLabel, FormControl, FormGroup, ListGroup, ListGroupItem, Modal, PageHeader} from 'react-bootstrap';

import CookieService from './service/cookie';
import UserService from './service/user';

interface UsersState {
    users: any[];
    selectedUser: any;
    selectedUserSkills: string[];
    selectedUserGroup: string;
    showModal: boolean;
}

class Users extends React.Component<{}, UsersState> {
    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            selectedUser: null,
            selectedUserGroup: '',
            selectedUserSkills: [],
            showModal: false,
            users: [],
        };

        this.renderUserList = this.renderUserList.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.onModalHide = this.onModalHide.bind(this);
        this.onUserClick = this.onUserClick.bind(this);
        this.renderSkillsList = this.renderSkillsList.bind(this);
        this.renderGroupList = this.renderGroupList.bind(this);
        this.onGroupChange = this.onGroupChange.bind(this);
        this.onGroupSubmit = this.onGroupSubmit.bind(this);

        UserService.getAll().then((res: any) => {
            this.setState({
                users: res.data,
            });
        });
    }

    public render() {
        return (
            <div>
                <PageHeader>
                    Users
                </PageHeader>
                <ListGroup>
                    {this.renderUserList()}
                </ListGroup>

                {this.renderModal()}
            </div>
        );
    }

    private renderModal() {
        if (this.state.selectedUser) {
            return (
                <Modal show={this.state.showModal}
                    onHide={this.onModalHide}>

                    <Modal.Header closeButton={true}>
                        <Modal.Title>{this.state.selectedUser.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5>Email: {this.state.selectedUser.email}</h5>
                        <h5>Address: {this.state.selectedUser.address}</h5>
                        <h4>Skills:</h4>
                        <ul>
                            {this.renderSkillsList()}
                        </ul>
                        {this.renderGroupList()}
                    </Modal.Body>
                </Modal>
            )
        } else {
            return null;
        }
    }

    private onUserClick(e: any) {
        const sub = e.target.value;
        const selectedUser = this.state.users.find((user: any) => user.sub === sub);
        const isAdmin = CookieService.getGroups().indexOf("Admins") > -1;

        UserService.getSkills(sub).then((res: any) => {
            this.setState({
                selectedUser,
                selectedUserSkills: res.data.skills,
                showModal: true,
            });
        });

        if (isAdmin) {
            UserService.getGroup(selectedUser.username).then((res: any) => {
                this.setState({
                    selectedUserGroup: res.data.group,
                });
            });
        }
    }

    private onModalHide() {
        this.setState({
            selectedUser: null,
            selectedUserGroup: '',
            selectedUserSkills: [],
            showModal: false,
        });
    }

    private renderUserList() {
        return this.state.users.map((user: any) =>
            <ListGroupItem header={user.name} value={user.sub} key={user.sub} onClick={this.onUserClick}>
                {user.email}
            </ListGroupItem>
        );
    }

    private renderSkillsList() {
        if (this.state.selectedUserSkills.length === 0) {
            return <Alert bsStyle="info">This user has no skills listed</Alert>
        }

        return this.state.selectedUserSkills.map((skill: string) =>
            <li key={skill}>
                {skill}
            </li>
        );
    }

    private renderGroupList() {
        if (this.state.selectedUserGroup === '') {
            return null;
        }

        return (
            <form>
                <FormGroup controlId="user-group">
                    <ControlLabel>Group:</ControlLabel>
                    <FormControl componentClass="select" value={this.state.selectedUserGroup} onChange={this.onGroupChange}>
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
            selectedUserGroup: e.target.value,
        });
    }

    private onGroupSubmit() {
        UserService.setGroup(this.state.selectedUser.username, this.state.selectedUserGroup);
    }
}

export default Users;
