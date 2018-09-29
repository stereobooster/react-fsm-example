// @flow

import type { FruitWidget, FruitResponse } from "src/types";

export type State =
  | {|
      state: "initial"
    |}
  | {|
      state: "fruit_loading",
      widget: FruitWidget
    |}
  | {|
      state: "fruit_error",
      error: mixed
    |}
  | {|
      state: "fruit_ok",
      widget: FruitWidget,
      resonse: FruitResponse
    |};

export const defaultState: State = {
  state: "initial"
};
