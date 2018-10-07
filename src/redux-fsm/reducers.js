//  @flow
import { type Dispatch as DispatchT } from "redux";
import { loop, Cmd, type Loop } from "redux-loop";
import { exhaustiveCheck } from "src/utils";
import { type State, defaultState } from "./state";
import type { FruitForm, FruitResponse } from "src/types";
import { fruitRequest } from "src/api/fruitRequest";
import history from "src/history";
import deepEqual from "fast-deep-equal";

type FruitSubmit = {
  type: "SUBMIT_FRUIT",
  form: FruitForm
};
type FruitError = {
  type: "SUBMIT_FRUIT_ERROR",
  error: mixed,
  form: FruitForm
};
type FruitOk = {
  type: "SUBMIT_FRUIT_OK",
  resonse: FruitResponse,
  form: FruitForm
};

export type Actions = FruitSubmit | FruitError | FruitOk;
export type Dispatch = DispatchT<Actions>;

export default (
  reduxState: State = defaultState,
  action: Actions
): Loop<State, Actions> | State => {
  switch (action.type) {
    case "SUBMIT_FRUIT":
      switch (reduxState.state) {
        case "initial":
        case "fruit_error":
        case "fruit_ok":
        case "fruit_loading":
          const { form } = action;
          const submitForm = Cmd.run(fruitRequest, {
            successActionCreator: resonse => ({
              type: "SUBMIT_FRUIT_OK",
              resonse,
              form
            }),
            failActionCreator: error => ({
              type: "SUBMIT_FRUIT_ERROR",
              error,
              form
            }),
            args: [form]
          });
          const navigateToTheNextPage = Cmd.run(path => history.push(path), {
            args: ["/step-2"]
          });
          return loop(
            {
              state: "fruit_loading",
              form
            },
            Cmd.list([submitForm, navigateToTheNextPage])
          );
        default:
          // exhaustive check doesn't work here, because "initial", "fruit_error"
          // and "fruit_ok" are crumpled together
          // exhaustiveCheck(reduxState.state);
          return reduxState;
      }
    case "SUBMIT_FRUIT_ERROR":
      // $FlowFixMe - guard against race condition
      if (!deepEqual(reduxState.form, action.form))
        return loop(reduxState, Cmd.none);
      switch (reduxState.state) {
        case "fruit_loading":
          const { state, ...rest } = reduxState;
          const navigateToPreviousPage = Cmd.run(
            (expectedPath, path) => {
              if (history.location.pathname === expectedPath)
                history.replace(path);
            },
            {
              args: ["/step-2", "/"]
            }
          );
          return loop(
            {
              ...rest,
              state: "fruit_error",
              error: action.error
            },
            navigateToPreviousPage
          );
        default:
          throw new Error("Impossible");
      }
    case "SUBMIT_FRUIT_OK":
      // $FlowFixMe - guard against race condition
      if (!deepEqual(reduxState.form, action.form))
        return loop(reduxState, Cmd.none);
      switch (reduxState.state) {
        case "fruit_loading":
          const { state, ...rest } = reduxState;
          return loop(
            {
              ...rest,
              state: "fruit_ok",
              resonse: action.resonse
            },
            Cmd.none
          );
        default:
          throw new Error("Impossible");
      }
    default:
      exhaustiveCheck(action.type);
      return reduxState;
  }
};
