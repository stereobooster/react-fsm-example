// @flow

import type { FruitForm, FruitResponse } from "src/types";

/**
 * State.state is not the brightest idea
 */
export type State =
  | {|
      state: "initial"
    |}
  | {|
      state: "fruit_loading",
      form: FruitForm
    |}
  | {|
      state: "fruit_error",
      form: FruitForm,
      error: mixed
    |}
  | {|
      state: "fruit_ok",
      form: FruitForm,
      resonse: FruitResponse
    |};

export const defaultState: State = {
  state: "initial"
};
