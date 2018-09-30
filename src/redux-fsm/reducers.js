//  @flow
import { type Dispatch as DispatchT } from "redux";
import { loop, Cmd, type Loop } from "redux-loop";
import { exhaustiveCheck } from "src/utils";
import { type State, defaultState } from "./state";
import type { FruitForm, FruitResponse } from "src/types";
import { fruitRequest } from "src/api/fruitRequest";

type FruitSubmit = {
  type: "SUBMIT_FRUIT",
  form: FruitForm
};
type FruitError = {
  type: "SUBMIT_FRUIT_ERROR",
  error: mixed
};
type FruitOk = {
  type: "SUBMIT_FRUIT_OK",
  resonse: FruitResponse
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
          return loop(
            {
              state: "fruit_loading",
              form: action.form
            },
            Cmd.run(fruitRequest, {
              successActionCreator: resonse => ({
                type: "SUBMIT_FRUIT_OK",
                resonse
              }),
              failActionCreator: error => ({
                type: "SUBMIT_FRUIT_ERROR",
                error
              }),
              args: [action.form]
            })
          );
        case "fruit_loading":
          // we don't allow more than one side effect same time
          return reduxState;
        default:
          // exhaustive check doesn't work here, because "initial", "fruit_error"
          // and "fruit_ok" are crumpled together
          // exhaustiveCheck(reduxState.state);
          return reduxState;
      }
    case "SUBMIT_FRUIT_ERROR":
      switch (reduxState.state) {
        case "fruit_loading":
          const { state, ...rest } = reduxState;
          return {
            ...rest,
            state: "fruit_error",
            error: action.error
          };
        default:
          throw new Error("Impossible");
      }
    case "SUBMIT_FRUIT_OK":
      switch (reduxState.state) {
        case "fruit_loading":
          const { state, ...rest } = reduxState;
          return {
            ...rest,
            state: "fruit_ok",
            resonse: action.resonse
          };
        default:
          throw new Error("Impossible");
      }
    default:
      exhaustiveCheck(action.type);
      return reduxState;
  }
};
