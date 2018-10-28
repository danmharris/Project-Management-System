import * as Cookies from 'js-cookie';
import * as queryString from 'query-string';
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import CookieService from './service/cookie';

import config from './config/config';
import Navigation from './Navigation';
import NewProject from './NewProject';
import Profile from './Profile';
import Project from './Project';
import Projects from './Projects';
import Users from './Users';

import './App.css';

class App extends React.Component {
  public render() {
    const parsedHash = queryString.parse(location.hash);
    if (parsedHash.id_token) {
      Cookies.set('jwt', parsedHash.id_token);
      location.hash = '';
    } else if (CookieService.isExpired()) {
      window.location.replace(`${config.LOGIN_URL}&redirect_uri=${window.location}`);
    }


    return (
      <div className="App">
        <Navigation />
        <div className="Container">
          <Router>
            <Switch>
              <Route path="/projects/:uuid" component={Project} />
              <Route path="/projects" component={Projects} />
              <Route path="/new_project" component={NewProject} />
              <Route path="/users" component={Users} />
              <Route path="/profile" component={Profile} />
            </Switch>
          </Router>
        </div>
      </div>
    );
  }
}

export default App;
