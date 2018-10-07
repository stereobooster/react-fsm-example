// @flow
import is, { type AssertionType } from "sarcastic";
import type { FruitForm } from "src/types";
import request from "./request";
import Cache from "tmp-cache";

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

opaque type AbortControllerSignal = void;
type AbortControllerT = {
  signal: AbortControllerSignal,
  abort: () => void
};

const once = fn => {
  let called = false;
  let result;
  return () => {
    if (called) return result;
    called = true;
    return (result = fn());
  };
};

const baseFruitRequestCreator = (form: FruitForm) => {
  let controller: AbortControllerT;
  // $FlowFixMe - flow have no types for AbortController and co
  controller = new AbortController();
  return [controller, once(() => baseFruitRequest(controller.signal, form))];
};

const baseFruitRequest = async (
  signal: AbortControllerSignal,
  form: FruitForm
) => {
  const endpoint =
    process.env.NODE_ENV === "development" ? "/fruits" : "/fruits.json";
  const response = await request(`${endpoint}?${queryToString(form)}`, {
    signal
  });
  if (!response.ok) throw new Error("Non 200 response");
  return is(await response.json(), fruitResponseShape);
};

const cache = new Cache<
  string,
  [AbortControllerT, () => Promise<FruitResponse>]
>({
  max: 5,
  maxAge: 60000
});

export const fruitRequestCreator = (form: FruitForm) => {
  const query = queryToString(form);
  let result = cache.get(query);
  if (!result) {
    result = baseFruitRequestCreator(form);
    cache.set(query, result);
  }
  return result;
};

export const prefetch = async (form: FruitForm): Promise<void> => {
  try {
    await fruitRequestCreator(form)[1]();
  } catch (e) {}
};
