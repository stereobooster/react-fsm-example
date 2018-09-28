// @flow
import React, { Component } from "react";
import { Route, Switch, Link } from "react-router-dom";

import StepOne from "src/components/StepOne";
import StepTwo from "src/components/StepTwo";
import StepThree from "src/components/StepThree";

class App extends Component<{}> {
  render() {
    return (
      <React.Fragment>
        <nav>
          <Link to="/">Step1</Link> | <Link to="/step-2">Step2</Link> |{" "}
          <Link to="/step-3">Step3</Link>
        </nav>
        <Switch>
          <Route path="/" exact component={StepOne} />
          <Route path="/step-2" exact component={StepTwo} />
          <Route path="/step-3" exact component={StepThree} />
          <Route component={() => "NotFoundPage"} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default App;
