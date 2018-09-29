// @flow
import React, { Component } from "react";
import { connect } from "react-redux";
import StepOneForm from "./StepOneForm";
import StepOneResult from "./StepOneResult";
import type { FruitForm } from "src/types";
import { type Dispatch, type State, fruitSubmitSideEffect } from "src/redux";

type Props = {
  state: State,
  submit: (form: FruitForm) => void
};

class StepOne extends Component<Props> {
  render() {
    const { submit, state } = this.props;
    return (
      <React.Fragment>
        <StepOneForm submit={submit} />
        <StepOneResult state={state} />
      </React.Fragment>
    );
  }
}

export default connect(
  (state: State) => ({ state }),
  (dispatch: Dispatch) => ({
    submit: (form: FruitForm) => {
      dispatch({ type: "SUBMIT_FRUIT", form });
      fruitSubmitSideEffect(dispatch, form);
    }
  })
)(StepOne);
