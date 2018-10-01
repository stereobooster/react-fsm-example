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
  const { state, ...rest } = reduxState;
  const navigateToTheNextPage = Cmd.run(path => history.push(path), {
    args: ["/step-2"]
  });
  return loop(
    {
      ...rest,
      state: "fruit_ok",
      resonse: action.resonse
    },
    navigateToTheNextPage
  );
```
