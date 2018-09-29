# React example

## Demonstration of how to convert Redux to FSM with the help of types

Task: we have a form where user enter can enter data, as soon as the user submits the form we need to show a spinner while AJAX request is running, as soon as AJAX request finishes show results in case of success or error in case of failure of the AJAX request.

### "Classical" reducer

This is how "classical" reducer can look like:

```ts
export default (reduxState: State = defaultState, action: Actions): State => {
  switch (action.type) {
    case "SUBMIT_FRUIT":
      return {
        ...reduxState,
        state: "fruit_loading",
        form: action.form
      };
    case "SUBMIT_FRUIT_ERROR":
      return {
        ...reduxState,
        state: "fruit_error",
        error: action.error
      };
    case "SUBMIT_FRUIT_OK":
      return {
        ...reduxState,
        state: "fruit_ok",
        resonse: action.resonse
      };
    default:
      exhaustiveCheck(action.type);
      return reduxState;
  }
};
```

This is actual AJAX request, a.k.a. side effect. We can use different solutions for side effects, like redux-thunk, redux-saga, redux-observable or redux-loop. Let's not focus on this, instead, we will trigger side effect explicitly with dispatch:

```ts
export const fruitSubmitSideEffect = (dispatch: Dispatch, form: FruitForm) => {
  fruitRequest(form).then(
    resonse => {
      dispatch({
        type: "SUBMIT_FRUIT_OK",
        resonse
      });
    },
    error => {
      dispatch({
        type: "SUBMIT_FRUIT_ERROR",
        error
      });
    }
  );
};

// And later

export default connect(
  ) => ({}),
  (dispatch: Dispatch) => ({
    submit: (form: FruitForm) => {
      dispatch({ type: "SUBMIT_FRUIT", form });
      fruitSubmitSideEffect(dispatch, form);
    }
  })
)(Component);
```

Previous state in action used for the creation of the new state, but it is not explicitly checked:

```ts
return {
  ...reduxState,
  ...newPartsOfState
};
```

Type of `State` can look like this:

```ts
export type State = {
  state: "initial" | "fruit_loading" | "fruit_error" | "fruit_ok";
  form?: FruitForm;
  error?: mixed;
  resonse?: FruitResponse;
};
```

One of the consequences is that we will need write additional type checks:

```ts
export default ({ state }: { state: State }) => {
  switch (state.state) {
    case "fruit_ok":
      return (
        state.resonse && // additional type check, that it is not undefined
        state.resonse.map(item => {}))
  }
```
