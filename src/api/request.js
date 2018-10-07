// @flow

const promiseRacePonyfill = <T>(values: Array<Promise<T>>): Promise<T> => {
  return new Promise((resolve, reject) => {
    values.forEach(value => {
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

const promiseWithTimeout = <T>(
  promise: Promise<T>,
  delay: number
): Promise<T> => {
  const timer = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("Timeout for Promise")), delay);
  });

  return promiseRacePonyfill([promise, timer]).then(response => response);
};

type ExtractOptionsType = <T>((string, T) => Promise<mixed>) => T;
type FetchOptions = $Call<ExtractOptionsType, typeof fetch>;
type RequestOptions = {
  ...FetchOptions,
  timeout: number
};

// fetch with timeout
export default (url: string, options: RequestOptions = {}) => {
  const { timeout = 30000, ...rest } = options;
  return promiseWithTimeout(
    fetch(url, { credentials: "same-origin", ...rest }),
    timeout
  );
};

export const pause = (timeout: number) =>
  new Promise<void>(resolve => setTimeout(resolve, timeout));

export const randomlyFail = (chance: number = 0.05) =>
  Math.random() > chance ? Promise.resolve() : Promise.reject();
