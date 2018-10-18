import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Navigation from './Navigation';
import NewProject from './NewProject'

import './App.css';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Navigation />
        <div className="Container">
          <Router>
            <Route path="/new_project" component={NewProject} />
          </Router>
        </div>
      </div>
    );
  }
}

export default App;
