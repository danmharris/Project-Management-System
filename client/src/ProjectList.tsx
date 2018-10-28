import * as React from 'react';

import { Alert, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import CookieService from './service/cookie';

import './Buttons.css';

interface ProjectListProps {
    projects: any[];
    header?: string;
    showRole?: boolean;
}

class ProjectList extends React.Component<ProjectListProps, {}> {
    constructor(props: any, context: any) {
        super(props, context);

        this.renderProjects = this.renderProjects.bind(this);
    }

    public render() {
        if (this.props.header) {
            return (
                <div>
                    <h4>{this.props.header}</h4>
                    {this.renderProjects()}
                </div>
            );
        } else {
            return (
                <div>
                    {this.renderProjects()}
                </div>
            )
        }
    }

    private renderProjects() {
        if(this.props.projects.length === 0) {
            return <Alert bsStyle="info">There aren't any projects in this category</Alert>
        }

        return this.props.projects.map((project: any) =>
            <Panel key={`projects-panel-${project.uuid}`}>
                <Panel.Heading><Link to={`/projects/${project.uuid}`}>{project.name}</Link>{this.renderRole(project)}</Panel.Heading>
                <Panel.Body>{project.description}</Panel.Body>
            </Panel>
        );
    }

    private renderRole(project: any) {
        if (this.props.showRole) {
            return <span id="project-role" className="float-right">{this.getRole(project)}</span>
        } else {
            return null;
        }
    }

    private getRole(project: any): string {
        const sub = CookieService.getSub();

        if (project.manager === sub) {
            return "Manager";
        }

        if (project.developers.indexOf(sub) > -1) {
            return "Developer";
        }

        return '';
    }
}

export default ProjectList;
