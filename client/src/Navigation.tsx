import * as React from 'react';
import { Nav, Navbar, NavDropdown, NavItem } from 'react-bootstrap';

class Navigation extends React.Component {
    public render() {
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
                  <NavItem href="#">
                    My Projects
                  </NavItem>
                  <NavItem href="#">
                    Projects
                  </NavItem>
                </Nav>
                <Nav pullRight={true}>
                  <NavDropdown title="User" id="user-dropdown">
                    <NavItem href="#">
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
