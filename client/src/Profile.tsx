import * as React from 'react';

import { Alert, Button, ControlLabel, FormControl, FormGroup, InputGroup, PageHeader } from 'react-bootstrap';

import CookieService from './service/cookie';
import UserService from './service/user';

interface ProfileState {
    name: string;
    sub: string;
    skillInput: string;
    skills: string[];
    err: string;
}

class Profile extends React.Component<{}, ProfileState> {
    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            err: '',
            name: CookieService.getName(),
            skillInput: '',
            skills: [],
            sub: CookieService.getSub(),
        };

        this.addSkill = this.addSkill.bind(this);
        this.removeSkill = this.removeSkill.bind(this);
        this.renderSkills = this.renderSkills.bind(this);
        this.onSkillInputChange = this.onSkillInputChange.bind(this);
        this.onUpdateClick = this.onUpdateClick.bind(this);

        UserService.getSkills(this.state.sub).then((res: any) => {
            this.setState({ skills: res.data.skills });
        }).catch((err) => this.setState({ err: `Unable to get skills. Reason: ${err.data.message}`}));
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
                    My Profile
                </PageHeader>
                <form>
                    <FormGroup controlId="form-skills">
                        <ControlLabel>Skills</ControlLabel>
                        {this.renderSkills()}
                        <InputGroup key="new">
                            <FormControl type="text" value={this.state.skillInput} onChange={this.onSkillInputChange} />
                            <InputGroup.Button><Button onClick={this.addSkill}>Add</Button></InputGroup.Button>
                        </InputGroup>
                        <Button onClick={this.onUpdateClick}>Update</Button>
                    </FormGroup>
                </form>
            </div>
        );
    }

    private renderSkills() {
        return this.state.skills.map((skill: string, index: number) =>
            <InputGroup key={index}>
                <FormControl type="text" disabled={true} value={skill} />
                <InputGroup.Button><Button value={skill} onClick={this.removeSkill}>Remove</Button></InputGroup.Button>
            </InputGroup>
        );
    }

    private removeSkill(e: any) {
        this.setState({
            skills: this.state.skills.filter((skill: string) => skill !== e.target.value),
        });
    }

    private addSkill(e: any) {
        this.setState({
            skills: [...this.state.skills, this.state.skillInput],
        });
    }

    private onSkillInputChange(e: any) {
        this.setState({ skillInput: e.target.value });
    }

    private onUpdateClick() {
        UserService.updateSkills(this.state.sub, this.state.skills)
            .catch((error) => this.setState({ err: `Unable to update skills. Reason: ${error.data.message}`}));
    }
}

export default Profile;
