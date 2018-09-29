//  @flow
import { type Dispatch as DispatchT } from "redux";
import { exhaustiveCheck } from "src/utils";
import { type State, defaultState } from "./state";
import type { FruitWidget, FruitResponse } from "src/types";
import { fruitRequest } from "src/api/fruitRequest";

type FruitSubmit = {
  type: "SUBMIT_FRUIT",
  widget: FruitWidget
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

export default (reduxState: State = defaultState, action: Actions): State => {
  switch (action.type) {
    case "SUBMIT_FRUIT":
      switch (reduxState.state) {
        case "initial":
          return {
            state: "fruit_loading",
            widget: action.widget
          };
        default:
          throw new Error("Inavlid transition");
      }
    case "SUBMIT_FRUIT_ERROR":
      switch (reduxState.state) {
        case "fruit_loading":
          return {
            state: "fruit_error",
            error: action.error
          };
        default:
          throw new Error("Inavlid transition");
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
          throw new Error("Inavlid transition");
      }
    default:
      exhaustiveCheck(action.type);
      return reduxState;
  }
};
