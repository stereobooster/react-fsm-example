//  @flow
import { type Dispatch as DispatchT } from "redux";
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

export const fruitSubmitSideEffect = (dispatch: Dispatch, form: FruitForm) => {
  fruitRequest(form).then(
    resonse => {
      dispatch({
        type: "SUBMIT_FRUIT_OK",
        resonse
      });
    },
    error => {
      dispatch({
        type: "SUBMIT_FRUIT_ERROR",
        error
      });
    }
  );
};

export default (reduxState: State = defaultState, action: Actions): State => {
  switch (action.type) {
    case "SUBMIT_FRUIT":
      switch (reduxState.state) {
        case "initial":
          return {
            state: "fruit_loading",
            form: action.form
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
