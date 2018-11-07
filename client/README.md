# Project Management Client
The frontend of this application is built using React combined with a number of libraries, including:
* React-Bootstrap: Provides Bootstrap CSS components as React components
* React-Router: Maps URLs to components
* query-string: Parses parameters provided in the URL e.g. query paramters, hash parameters
* js-cookie: Easy interface for storing/retrieving cookies
* jsonwebtoken: Allows the JWT to be parsed to retrieve user information

## Components
### App
The main root component of the application, which is injected into the index HTML file. This contains the react router for determining the component to render depending on the URL

### Dashboard
Contains a list of projects, that are sorted by their status. This only includes projects the current user is on

### EditProjectDevelopersForm
Allows changing the users assigned to a particular project e.g. the manager or developers. This should only render for users who have write permissions on a project

#### Props:
* users: A list of user objects to resolve UUIDs and display who to add
* developerSubs: A list of the current developers on the project (their unique sub)
* managerSub: The unique sub of the current manager of the project
* uuid: The UUID of the project being modified

### EditProjectForm
Provides a form for modifying the base attributes of the project (name, description and status)

#### Props:
* name: Prepopulates the name field
* description: Preopulates the description field
* status: Preopulate the status field
* onSubmit: Callback function when the user clicks the save button

### Logout
Non view component that simply removes the users token and logs them out

### MyProjects
Contains a list of projects that a user is currently participating in, split by the role that user has. There is a list for being a manager and a developer

### Navigation
Displays the navigation links at the top of the page

### NewProject
A minimal component that contains only an EditProjectForm, providing a callback that calls the create project endpoint on the API

### Profile
Displays the skills the user has and allows them to update the list

### Project
Displays information about a single project including:
* Name
* Description
* Status
* Manager Information
* Developer Information

If the user has write access there is an edit/delete button, otherwise there is a leave/join button

### ProjectList
Generic component for displaying a list of projects in card-style views, with links to the specific project

#### Props:
* projects: The list of projects to display
* header: Optional string that displays title above the list
* showRole: Whether to display the role the user has in each project

### Projects
Project list that displays all projects currently on the system, with the role the user has on the project being displayed

### Users
List of all users registered on the system. Clicking on a user provides all the details about them and if they are an admin can view/update the user's group
