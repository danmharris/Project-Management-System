import * as React from 'react';
import { Nav, Navbar, NavDropdown, NavItem } from 'react-bootstrap';

import CookieService from './service/cookie';

class Navigation extends React.Component {
    public render() {
        const name = CookieService.getName();

        return (
          <div className="App">
            <Navbar>
              <Navbar.Header>
                <Navbar.Brand>
                  <a href="/">Project Manager</a>
                </Navbar.Brand>
                <Navbar.Toggle />
              </Navbar.Header>
              <Navbar.Collapse>
                <Nav>
                  <NavItem href="/my_projects">
                    My Projects
                  </NavItem>
                  <NavItem href="/projects">
                    Projects
                  </NavItem>
                  <NavItem href="/users">
                    Users
                  </NavItem>
                </Nav>
                <Nav pullRight={true}>
                  <NavDropdown title={name} id="user-dropdown">
                    <NavItem href="/profile">
                      My Profile
                    </NavItem>
                    <NavItem href="#">
                      Settings
                    </NavItem>
                    <NavItem href="#">
                      Logout
                    </NavItem>
                  </NavDropdown>
                </Nav>
              </Navbar.Collapse>
            </Navbar>

          </div>
        );
      }
}

export default Navigation;
