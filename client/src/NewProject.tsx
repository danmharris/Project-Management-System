import * as React from 'react';
import { Button, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';

interface NewProjectState {
    name: string;
    description: string;
}

class NewProject extends React.Component<{}, NewProjectState> {

    constructor(props: any, context: any) {
        super(props, context);

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            description: '',
            name: '',
        };
    }

    public render() {
        return (
            <form>
                <FormGroup
                    controlId="form-name"
                    validationState={this.validateName()}
                >
                    <ControlLabel>Project Name</ControlLabel>
                    <FormControl
                        type="text"
                        placeholder="enter name"
                        onChange={this.handleNameChange}
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
                    />
                </FormGroup>

                <Button
                    disabled={!this.isFormValid()}
                    onClick={this.handleSubmit}
                >Create</Button>
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
        // Submit form to API and redirect if successful
    }

}

export default NewProject;
