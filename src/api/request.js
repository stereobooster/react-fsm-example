// @flow

// translation of https://dom.spec.whatwg.org/#abortcontroller
// because flow have no types for AbortController and co
declare interface AbortSignal extends EventTarget {
  +aborted: boolean;
  onabort: EventHandler;
}
declare class AbortController {
  +signal: AbortSignal;
  abort: () => void;
}

type RequestOptionsTimeout = {|
  ...$Exact<RequestOptions>,
  signal?: AbortSignal,
  timeout?: number
|};

// fetch with timeout
export default (url: string, options?: RequestOptionsTimeout) => {
  let { timeout = 5000, signal, ...rest } = options || {};
  if (signal !== undefined)
    throw new Error("Signal not supported in timeoutable fetch");
  const controller = new AbortController();
  return new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timeout for Promise"));
      controller.abort();
    }, timeout);
    fetch(url, {
      credentials: "same-origin",
      signal: controller.signal,
      ...options
    })
      .finally(() => clearTimeout(timer))
      .then(resolve, reject);
  });
};
