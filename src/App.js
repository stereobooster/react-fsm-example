// @flow
import React, { Component } from "react";
import { Route, Switch, Link } from "react-router-dom";

class App extends Component<{}> {
  render() {
    return (
      <React.Fragment>
        <nav>
          <Link to="/">Step1</Link> | <Link to="/step-2">Step2</Link> |{" "}
          <Link to="/step-3">Step3</Link>
        </nav>
        <Switch>
          <Route path="/" exact component={() => "Step1"} />
          <Route path="/step-2" exact component={() => "Step2"} />
          <Route path="/step-3" exact component={() => "Step3"} />
          <Route component={() => "NotFoundPage"} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default App;
