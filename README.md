# React example

## ToC

1. [Redux as Finite State Machine](https://github.com/stereobooster/react-fsm-example/tree/post-1)
2. [Side effects in Redux](https://github.com/stereobooster/react-fsm-example/tree/post-2)
3. Optimistic UI

## Multi-step form

Requirements change - they always do. Now we need to implement multi-step form, on the first page, the user enters data, on the second page selects an item, on the third page asked for credentials or to provide payment details.

Component which shows list of items is stateless, so it is trivial to move it to the next page, also need to read state from redux and pass it to the items list component, and last but not least we need to navigate user to the next page - we can do this is as a side effect:

```js
case "SUBMIT_FRUIT_OK":
  const navigateToTheNextPage = Cmd.run(path => history.push(path), {
    args: ["/step-2"]
  });
  return loop(
    { ...state: "fruit_ok", ... },
    navigateToTheNextPage
  );
```

The issue here is that after user press button, the application waits for a response before doing the next thing. And from a user point of view this is perceived as the button is unresponsive, that application is slow or broken (especially if the response takes more than ~200ms).

## Optimistic UI

One way to solve this problem is, instead of waiting, proceed as if you actually have response, transition to the next page, start to draw page (header, maybe breadcrumbs etc), and as soon as we get to actual content draw a spinner\*, if request is pending or the content itself.

\* - with 200ms delay, we will give some more time ("unnoticeable" for the user) for the request before we will admit it takes too long. Not sure where I get 200ms initially, [another opinion it should 100ms](https://www.nngroup.com/articles/response-times-3-important-limits/).

We can do this:

```js
case "SUBMIT_FRUIT":
  const navigateToTheNextPage = Cmd.run(path => history.push(path), {
    args: ["/step-2"]
  });
  return loop(
    { ...state: "fruit_loading", ... },
    Cmd.list([submitForm, navigateToTheNextPage])
  );
```

Also, we need to adjust error case:

```js
case "SUBMIT_FRUIT_ERROR":
  const navigateToPreviousPage = Cmd.run(
    (expectedPath, path) => {
      // check that user hasn't navigated away
      if (history.location.pathname === expectedPath)
        history.replace(path);
    },
    {
      args: ["/step-2", "/"]
    }
  );
  return loop(
    { ...state: "fruit_error", ... },
    navigateToPreviousPage
  );
```

And remove an effect from "OK" case:

```js
case "SUBMIT_FRUIT_OK":
  return loop(
    { ...state: "fruit_ok", ... },
    Cmd.none
  );
```

## Prefetch

Ok, it is better, but let's not stop here. We can win some milliseconds if we will launch request as soon as we have valid data for it, e.g. do not wait for the user to actually press button, but send the request as soon as user provided valid data

To simulate real-life network I created `setupProxy.js` which provides randomly slow-ish responses (at least 100ms long).

### When to trigger prefetch

The question is how to catch time between the moment when the user finishes input and submits the form.

#### When users mouse approaches the end of the form

Run prefetch when users mouse approaches the end of the form. Doesn't work for mobile devices.

```js
<div
  onMouseEnter={() => {
    this.validateAndPrefetch(this.state.values);
  }}
>
  <button type="submit">Search</button>
</div>
```

#### On change

Run prefetch on change of each input. This approach is problematic for text fields (inputs and textarea), because it will create a flood of requests, and because the browser can have a limited number of requests simultaneously it can slow down final performance. It may work for discrete inputs though, like selects/combo boxes, checkboxes, calendars and similar.

```js
handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
  const { name, value, type } = e.target;
  const values = {
    ...this.state.values,
    [name]: value
  };
  this.setState({ values });
  if (isDiscrete(type)) this.validateAndPrefetch(values);
};
```

#### On blur

Run prefetch on blur (unfocus), this can work unless all fields in the form required than there, most likely, will be no pause between blur and form submit.

```js
handleBlur = (e: SyntheticEvent<HTMLInputElement>) => {
  const { name, type } = e.target;
  const [errors] = validate(this.state.values);
  this.setState({
    touched: {
      ...this.state.touched,
      [name]: true
    },
    errors
  });
  if (!isDiscrete(type)) this.validateAndPrefetch(values);
};
```

### How to cache results

#### Browser cache

The simplest option is to rely on the browser cache e.g. launch request and "pipe its result to `dev/null`".

**Pros**: uses cache time specified by the server.

**Cons**: if requests are slow it can happen that, there will be not enough time for prefetch to get cached before user submit.

```js
const baseFruitRequest = (form: FruitForm) => {
  //...
  const query = `name=${form.name}&start=${form.start.toISOString()}`;
  return request(`${endpoint}?${query}`);
};

export const prefetch = async (form: FruitForm): Promise<void> => {
  try {
    await baseFruitRequest(form);
  } catch (e) {}
};
```

### LRU in "JS land"

Use small LRU based cache to cache fetch requests.

**Cons** this is additional cache, which can be misconfigured compared to server instructions (cache headers).

**Pros** will work for slow requests, users subsequent submit will be picked up from the cache

What to use for LRU?

- I created a [fork of lru_map](https://github.com/stereobooster/lru_map) with minimalistic functionality (implemented with a doubly linked list and Map)
- There is even smaller implementation - [tmp-cache](https://github.com/lukeed/tmp-cache) (implemented with array and Map)

```js
const cache = new Cache<string, Promise<FruitResponse>>({
  max: 5,
  maxAge: 60000
});

export const fruitRequest = (form: FruitForm): Promise<FruitResponse> => {
  const query = queryToString(form);
  let result = cache.get(query);
  if (!result) {
    result = baseFruitRequest(form);
    cache.set(query, result);
  }
  return result;
};

export const prefetch = async (form: FruitForm): Promise<void> => {
  try {
    await fruitRequest(form);
  } catch (e) {}
};
```

### More thoughts on prefetch

From my personal experimentation, I found that prefetch can win anywhere from 300ms to seconds.

But this comes with a cost - we broke encapsulation. Connector-component was only responsible for dispatching actions and logic was encapsulated in Redux, but now it (logic) is also exposed to the connector.

## When to use it

> With Great Power Comes Great Responsibility

|          | Optimistic UI | Prefetch |
|----------|---------------|----------|
| GET-ish  | Yes           | Yes      |
| POST-ish | Maybe         | No       |
