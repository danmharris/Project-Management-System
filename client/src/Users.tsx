import * as React from 'react';

import { Alert, FormControl, FormGroup, ListGroup, ListGroupItem, PageHeader} from 'react-bootstrap';

import UserService from './service/user';
import UserDetails from './UserDetails';

interface UsersState {
    users: any[];
    search: string;
    selectedUser: any;
    selectedUserSkills: string[];
    selectedUserGroup: string;
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
            users: [],
        };

        this.renderUserList = this.renderUserList.bind(this);
        this.onModalHide = this.onModalHide.bind(this);
        this.onUserClick = this.onUserClick.bind(this);
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
                {this.state.selectedUser && <UserDetails user={this.state.selectedUser} onModalHide={this.onModalHide} />}
            </div>
        );
    }

    private onUserClick(e: any) {
        const sub = e.target.value;
        const selectedUser = this.state.users.find((user: any) => user.sub === sub);

        this.setState({
            selectedUser,
        });

    }

    private onModalHide() {
        this.setState({
            selectedUser: null,
            selectedUserGroup: '',
            selectedUserSkills: [],
        });
    }

    private renderUserList() {
        return this.state.users.filter(user => user.name.toLowerCase().includes(this.state.search)).map((user: any) =>
            <ListGroupItem header={user.name} value={user.sub} key={user.sub} onClick={this.onUserClick}>
                {user.email}
            </ListGroupItem>
        );
    }

    private onSearchChange(e: any) {
        this.setState({ search: e.target.value.toLowerCase() });
    }
}

export default Users;
