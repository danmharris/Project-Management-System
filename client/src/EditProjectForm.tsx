import * as React from 'react';
import { Alert, Button, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';

interface EditProjectState {
    name: string;
    description: string;
    err: string;
    success: string;
}

interface EditProjectProps {
    name?: string;
    description?: string;
    onSubmit: (name: string, description: string) => Promise<any>;
}

class EditProject extends React.Component<EditProjectProps, EditProjectState> {

    constructor(props: any, context: any) {
        super(props, context);

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            description: props.description ? props.description : '',
            err: '',
            name: props.name ? props.name: '',
            success: '',
        };
    }

    public render() {
        let alert: any;
        if (this.state.err) {
            alert = <Alert bsStyle="danger">{this.state.err}</Alert>
        }

        if (this.state.success) {
            alert = <Alert bsStyle="info">{this.state.success}</Alert>
        }

        return (
            <form>
                {alert}
                <FormGroup
                    controlId="form-name"
                    validationState={this.validateName()}
                >
                    <ControlLabel>Project Name</ControlLabel>
                    <FormControl
                        type="text"
                        placeholder="enter name"
                        onChange={this.handleNameChange}
                        value={this.state.name}
                    />
                </FormGroup>
                <FormGroup
                    controlId="form-description"
                    validationState={this.validateDescription()}
                >
                    <ControlLabel>Description</ControlLabel>
                    <FormControl
                        componentClass="textarea"
                        placeholder="enter description"
                        onChange={this.handleDescriptionChange}
                        value={this.state.description}
                    />
                </FormGroup>

                <Button
                    disabled={!this.isFormValid()}
                    onClick={this.handleSubmit}
                >Save</Button>
            </form>
        );
    }

    private validateName(): any {
        const length = this.state.name.length;
        if (length > 0) {
            return 'success';
        } else {
            return 'error';
        }
    }

    private validateDescription(): any {
        const length = this.state.description.length;
        if (length > 0) {
            return 'success';
        } else {
            return 'error';
        }
    }

    private isFormValid(): boolean {
        return this.validateDescription() === 'success'
            && this.validateName() === 'success';
    }

    private handleNameChange(e: any): void {
        this.setState({ name: e.target.value });
    }

    private handleDescriptionChange(e: any): void {
        this.setState({ description: e.target.value });
    }

    private handleSubmit(e: any): void {
       this.props.onSubmit(this.state.name, this.state.description)
            .then(() => this.setState({ success: "Successfully saved" }))
            .catch(() => this.setState({ err: "Unable to save project. Please try again later"}));
    }

}

export default EditProject;
