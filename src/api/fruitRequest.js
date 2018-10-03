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

const baseFruitRequest = (form: FruitForm) => {
  const endpoint =
    process.env.NODE_ENV === "development" ? "/fruits" : "/fruits.json";
  return request(
    `${endpoint}?name=${form.name}&start=${form.start.toISOString()}`
  );
};

export const prefetch = async (form: FruitForm): Promise<void> => {
  try {
    await baseFruitRequest(form);
  } catch (e) {}
};

export const fruitRequest = async (form: FruitForm): Promise<FruitResponse> => {
  const response = await baseFruitRequest(form);
  if (!response.ok) throw new Error("Non 200 response");
  return is(await response.json(), fruitResponseShape);
};
