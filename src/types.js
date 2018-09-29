// @flow

// how to do reexport?
import type { FruitResponse as fr } from "src/api/fruitRequest.js";

export type FruitWidget = {
  name: string,
  start: Date
};
export type FruitResponse = fr;
