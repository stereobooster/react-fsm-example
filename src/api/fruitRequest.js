// @flow
import is, { type AssertionType } from "sarcastic";
import type { FruitWidget } from "src/types";
import request from "./request";

const fruitResponseShape = is.shape({
  name: is.string,
  start: is.date
});

export type FruitResponse = AssertionType<typeof fruitResponseShape>;

export const fruitRequest = async (
  widget: FruitWidget
): Promise<FruitResponse> => {
  const response = await request(
    `/fruit.json?name=${widget.name}&start=${widget.start.toISOString()}`
  );
  if (!response.ok) {
    throw new Error("Non 200 response");
  }
  return is(await response.json(), fruitResponseShape);
};
