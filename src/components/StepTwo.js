// @flow
import React from "react";
import { connect } from "react-redux";
import StepOneResult from "./StepOneResult";
import { type Dispatch, type State } from "src/redux";

type Props = {
  state: State
};

const StepTwo = ({ state }: Props) => (
  <React.Fragment>
    <StepOneResult state={state} />
  </React.Fragment>
);

export default connect(
  (state: State) => ({ state }),
  (dispatch: Dispatch) => ({})
)(StepTwo);
