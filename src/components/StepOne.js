// @flow
import React, { Component } from "react";
import { connect } from "react-redux";
import StepOneForm from "./StepOneForm";
import type { FruitWidget } from "src/types";
import { type State, type Dispatch } from "src/redux";

type Props = {
  submit: (widget: FruitWidget) => void
};

class StepOne extends Component<Props> {
  render() {
    const { submit } = this.props;
    return <StepOneForm submit={submit} />;
  }
}

export default connect(
  State => ({}),
  (dispatch: Dispatch) => ({
    submit: (widget: FruitWidget) => {
      dispatch({ type: "SUBMIT_FRUIT", widget });
    }
  })
)(StepOne);
