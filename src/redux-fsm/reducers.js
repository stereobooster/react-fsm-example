//  @flow
import { type Dispatch as DispatchT } from "redux";
import { loop, Cmd, type Loop } from "redux-loop";
import { exhaustiveCheck } from "src/utils";
import { type State, defaultState } from "./state";
import type { FruitForm, FruitResponse } from "src/types";
import { fruitRequestCreator } from "src/api/fruitRequest";
import history from "src/history";
import deepEqual from "fast-deep-equal";

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
      const [controller, fruitRequest] = fruitRequestCreator(action.form);
      const submitForm = Cmd.run(fruitRequest, {
        successActionCreator: resonse => ({
          type: "SUBMIT_FRUIT_OK",
          resonse
        }),
        failActionCreator: error => ({
          type: "SUBMIT_FRUIT_ERROR",
          error
        }),
        args: [] //[action.form]
      });
      const navigateToTheNextPage = Cmd.run(path => history.push(path), {
        args: ["/step-2"]
      });
      switch (reduxState.state) {
        case "initial":
        case "fruit_error":
        case "fruit_ok":
          return loop(
            {
              state: "fruit_loading",
              form: action.form,
              controller
            },
            Cmd.list([submitForm, navigateToTheNextPage])
          );
        case "fruit_loading":
          if (deepEqual(reduxState.form, action.form)) {
            // already running
            return loop(reduxState, Cmd.list([navigateToTheNextPage]));
          } else {
            // cancel previous, run new one
            const cancelPreviousRequest = Cmd.run(
              controller => {
                // $FlowFixMe - flow have no types for AbortController and co
                controller.abort();
              },
              {
                args: [reduxState.controller]
              }
            );
            return loop(
              {
                state: "fruit_loading",
                form: action.form,
                controller
              },
              Cmd.list([
                cancelPreviousRequest,
                submitForm,
                navigateToTheNextPage
              ])
            );
          }
        default:
          // exhaustive check doesn't work here, because "initial", "fruit_error"
          // and "fruit_ok" are crumpled together
          // exhaustiveCheck(reduxState.state);
          return reduxState;
      }
    case "SUBMIT_FRUIT_ERROR":
      switch (reduxState.state) {
        case "fruit_loading":
          // $FlowFixMe - flow have no types for AbortController and co
          if (action.error instanceof DOMException) {
            // Ignore errors from cancelPreviousRequest
            return loop(reduxState, Cmd.none);
          }
          const { state, controller, ...rest } = reduxState;
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
      switch (reduxState.state) {
        case "fruit_loading":
          const { state, controller, ...rest } = reduxState;
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
