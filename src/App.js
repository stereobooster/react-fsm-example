// @flow
import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";

import history from "src/history";
import StepOne from "src/components/StepOne";
import StepTwo from "src/components/StepTwo";

class App extends Component<{}> {
  componentDidMount() {
    // we don't store state so we will always redirect user to the main page
    // in the future we can save redux state in sessionStorage
    history.replace("/");
  }
  render() {
    return (
      <React.Fragment>
        <Switch>
          <Route path="/" exact component={StepOne} />
          <Route path="/step-2" exact component={StepTwo} />
          <Route component={() => "NotFoundPage"} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default App;
