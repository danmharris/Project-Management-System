import * as React from 'react';

import { Alert, Button, ControlLabel, FormControl, FormGroup, ListGroup, ListGroupItem, Modal, PageHeader} from 'react-bootstrap';

import CookieService from './service/cookie';
import UserService from './service/user';

interface UsersState {
    users: any[];
    search: string;
    selectedUser: any;
    selectedUserSkills: string[];
    selectedUserGroup: string;
    showModal: boolean;
    err: string;
}

class Users extends React.Component<{}, UsersState> {
    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            err: '',
            search: '',
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
        this.onSearchChange = this.onSearchChange.bind(this);

        UserService.getAll().then((res: any) => {
            this.setState({
                users: res.data,
            });
        }).catch((error) => this.setState({ err: `Unable to get users. Reason: ${error.data.message}`}));
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
                    Users
                </PageHeader>
                <form>
                    <FormGroup controlId="form-search">
                        <FormControl type="text" value={this.state.search} onChange={this.onSearchChange} placeholder="Search..."/>
                    </FormGroup>
                </form>
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
        }).catch((error) => this.setState({ err: `Unable to get user information. Reason: ${error.data.message}`}));;

        if (isAdmin) {
            UserService.getGroup(selectedUser.username).then((res: any) => {
                this.setState({
                    selectedUserGroup: res.data.group,
                });
            }).catch((error) => this.setState({ err: `Unable to get group information. Reason: ${error.data.message}`}));;
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
        return this.state.users.filter(user => user.name.toLowerCase().includes(this.state.search)).map((user: any) =>
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
        UserService.setGroup(this.state.selectedUser.username, this.state.selectedUserGroup)
            .catch((error) => this.setState({ err: `Unable to update group. Reason: ${error.data.message}`}));;
    }

    private onSearchChange(e: any) {
        this.setState({ search: e.target.value.toLowerCase() });
    }
}

export default Users;
