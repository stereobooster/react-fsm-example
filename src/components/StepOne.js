// @flow
import React from "react";
import { connect } from "react-redux";
import StepOneForm from "./StepOneForm";
import type { FruitForm } from "src/types";
import { type Dispatch, type State } from "src/redux";

type Props = {
  state: State,
  submit: (form: FruitForm) => void
};

const StepOne = ({ submit, state }: Props) => (
  <React.Fragment>
    <StepOneForm
      submit={submit}
      stateState={state.state}
      form={state.form ? state.form : undefined}
    />
  </React.Fragment>
);

export default connect(
  (state: State) => ({ state }),
  (dispatch: Dispatch) => ({
    submit: (form: FruitForm) => dispatch({ type: "SUBMIT_FRUIT", form })
  })
)(StepOne);
