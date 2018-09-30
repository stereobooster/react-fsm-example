// @flow
import is, { type AssertionType } from "sarcastic";
import type { FruitForm } from "src/types";
import request from "./request";

const fruitResponseShape = is.arrayOf(
  is.shape({
    name: is.string,
    price: is.number,
    currency: is.string
  })
);

export type FruitResponse = AssertionType<typeof fruitResponseShape>;

export const fruitRequest = async (form: FruitForm): Promise<FruitResponse> => {
  const response = await request(
    `/fruits.json?name=${form.name}&start=${form.start.toISOString()}`
  );
  if (!response.ok) throw new Error("Non 200 response");
  return is(await response.json(), fruitResponseShape);
};