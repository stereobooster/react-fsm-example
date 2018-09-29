//  @flow
import { type Dispatch as DispatchT } from "redux";
import { exhaustiveCheck } from "src/utils";
import { type State, defaultState } from "src/redux/state";
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

export default (store: State = defaultState, action: Actions): State => {
  switch (action.type) {
    case "SUBMIT_FRUIT":
      return {
        state: "fruit_loading",
        widget: action.widget
      };
    case "SUBMIT_FRUIT_ERROR":
      return {
        state: "fruit_error",
        error: action.error
      };
    case "SUBMIT_FRUIT_OK":
      switch (store.state) {
        case "fruit_loading":
          const { state, ...rest } = store;
          return {
            ...rest,
            state: "fruit_ok",
            resonse: action.resonse
          };
        default:
          throw new Error("Inavlid transition");
      }
    default:
      return exhaustiveCheck(action.type);
  }
};
