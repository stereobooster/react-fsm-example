// @flow
import is, { type AssertionType } from "sarcastic";
import type { FruitForm } from "src/types";
import request from "./request";
// import Cache from "tmp-cache";

const fruitResponseShape = is.arrayOf(
  is.shape({
    name: is.string,
    price: is.number,
    currency: is.string
  })
);

export type FruitResponse = AssertionType<typeof fruitResponseShape>;

const queryToString = (form: FruitForm) =>
  `name=${form.name}&start=${form.start.toISOString()}`;

const baseFruitRequest = async (form: FruitForm, signal?: mixed) => {
  const endpoint =
    process.env.NODE_ENV === "development" ? "/fruits" : "/fruits.json";
  const response = await request(`${endpoint}?${queryToString(form)}`, {
    signal
  });
  if (!response.ok) throw new Error("Non 200 response");
  return is(await response.json(), fruitResponseShape);
};

// const cache = new Cache<string, Promise<FruitResponse>>({
//   max: 5,
//   maxAge: 60000
// });

export const fruitRequest = (
  form: FruitForm,
  signal?: mixed
): Promise<FruitResponse> => {
  // const query = queryToString(form);
  // let result = cache.get(query);
  // if (!result) {
  //   result = baseFruitRequest(form);
  //   cache.set(query, result);
  // }
  // return result;
  return baseFruitRequest(form, signal);
};

export const prefetch = async (form: FruitForm): Promise<void> => {
  // try {
  //   await fruitRequest(form);
  // } catch (e) {}
};
