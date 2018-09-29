// @flow

import type { FruitForm, FruitResponse } from "src/types";

/**
 * State.state is not the brightest idea
 */
export type State = {
  state: "initial" | "fruit_loading" | "fruit_error" | "fruit_ok",
  form?: FruitForm,
  error?: mixed,
  resonse?: FruitResponse
};

export const defaultState: State = {
  state: "initial"
};
