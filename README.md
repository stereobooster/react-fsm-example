# React example

## ToC

1. [Turn Redux into Finite State Machine with the help of types](https://github.com/stereobooster/react-fsm-example/tree/post-1)
2. [Turn Redux into Finite State Machine vol. 2: side effects](https://github.com/stereobooster/react-fsm-example/tree/post-2)
3. Turn Redux into Finite State Machine vol. 3 ...

## Multi-step form

Requirements change - they always do. Now we need to implement multi-step form, on the first page user enters data, on the second page selects an item, on the third page asked for credentials or to provide payment details.

Component which shows list of items is statelees, so it is trivial to move it to the next page, also need to read state from redux and pass it to the items list component, and last but not least we need to nivagate user to the next page - we can do this is as a side effect:

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

- - with 200ms delay, we will give some more time ("unnoticeable" for the user) for the request before we will admit it takes too long

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

also we need to adjust error case:

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

And remove effect from "OK" case:

```js
case "SUBMIT_FRUIT_OK":
  return loop(
    { ...state: "fruit_ok", ... },
    Cmd.none
  );
```
