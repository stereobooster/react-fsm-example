// @flow
import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";

import StepOne from "src/components/StepOne";

class App extends Component<{}> {
  render() {
    return (
      <React.Fragment>
        <Switch>
          <Route path="/" exact component={StepOne} />
          <Route component={() => "NotFoundPage"} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default App;
