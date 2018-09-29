# Pragmatic types: How to turn Redux to Finite State Machine with the help of types

## What we want to do

We want to build a form where the user can enter data, as soon as the user submits the form we need to show a loading state while AJAX request is running, as soon as AJAX request finishes show results in case of success or error in case of failure of the AJAX request.

Let's create a "classical" reducer for this task and "Finite State Machine" reducer so we can compare. Full code is in this repository.

## "Classical" reducer

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

`SUBMIT_FRUIT` is an action dispatched in response to the form submit.
`SUBMIT_FRUIT_ERROR` and `SUBMIT_FRUIT_OK` are dispatched in response to side effect e.g. AJAX request. We can use different solutions for side effects, like redux-thunk, redux-saga, redux-observable or redux-loop. Let's not focus on this, instead, we will trigger side effect explicitly with dispatch.

Here is how AJAX request can look lie:

```ts
export const fruitSubmitSideEffect = (dispatch: Dispatch, form: FruitForm) => {
  // uses fetch inside returns a Promise
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

// and later

export default connect(
  () => ({}),
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

## Finite State Machine

Finite State Machine (FSM) suppose to have finite states. Let's force it with the type system. This is Flow type, but TypeScript would look similar (there is no need in `{||}` in TS).

```ts
export type State =
  | {|
      state: "initial"
    |}
  | {|
      state: "fruit_loading",
      form: FruitForm
    |}
  | {|
      state: "fruit_error",
      form: FruitForm,
      error: mixed
    |}
  | {|
      state: "fruit_ok",
      form: FruitForm,
      resonse: FruitResponse
    |};
```

Now we can't use the previous state without checking it. If we would do

```js
return {
  ...reduxState,
  state: "fruit_loading",
  form: action.form
};
```

Flow would complain:

```
Could not decide which case to select. Since case 2 [1] may work but if it doesn't case 3 [2] looks promising too. To fix add a type annotation to .form [3] or to .state [3].

     src/redux-fsm/state.js
 [1] 12│   | {|
     13│       state: "fruit_loading",
     14│       form: FruitForm
     15│     |}
 [2] 16│   | {|
     17│       state: "fruit_error",
     18│       form: FruitForm,
     19│       error: mixed
     20│     |}
```

So now we need to do something like this:

```ts
switch (action.type) {
  case "SUBMIT_FRUIT":
    switch (reduxState.state) {
      case "initial":
        return {
          state: "fruit_loading",
          form: action.form
        };
      default:
        throw new Error("Inavlid transition");
    }
}
```

We check what action is about to happen, what is the previous state and after this, we decide What to do. This approach forces us to think about all transition in the system explicitly.

```
initial
  SUBMIT_FRUIT       -> fruit_loading (1)
  SUBMIT_FRUIT_ERROR -> ?             (2)
  SUBMIT_FRUIT_OK    -> ?             (2)
fruit_loading
  SUBMIT_FRUIT       -> fruit_loading (3)
  SUBMIT_FRUIT_ERROR -> fruit_error   (4)
  SUBMIT_FRUIT_OK    -> fruit_ok      (5)
fruit_error
  SUBMIT_FRUIT       -> fruit_loading (6)
  SUBMIT_FRUIT_ERROR -> ?             (7)
  SUBMIT_FRUIT_OK    -> ?             (7)
fruit_ok
  SUBMIT_FRUIT       -> fruit_loading (6)
  SUBMIT_FRUIT_ERROR -> ?             (7)
  SUBMIT_FRUIT_OK    -> ?             (7)
```

> Side note: **Why would you want to do this?** To formally specify UIs, to prove that there are no errors in UI logic. For example:
>
> - You can prototype UI logic with [sketch.systems](https://sketch.systems/)
> - [Use Alloy (lighter alternative to TLA+) to analyze your UI](https://www.hillelwayne.com/post/formally-specifying-uis/)
> - This specification can be shared between UX people and developers
> - Also, see [Verifying ReasonReact component logic — ReasonML & Imandra](https://medium.com/imandra/verifying-reasonreact-component-logic-reasonml-imandra-e350d4812a9f)

> Side note 2: I implemented "reversed" FSM in the reducer, it checks action first and the state second

(1, 5) "Happy" path - user submits the form and gets a response.
(1, 4) Error path - user submits the form and gets an error.
(6) Repeated search - there is already error or successful response, the user repeats the search.
(2) Never happens - we can assume it never happens and throws an exception in that case.
(7) Race condition - we already have a response (or error) and a new one arrives, can happen only if we allow more than one side effect at a time.
(3) Repeated search - there is one search pending and the user asks for different or maybe clicks impatiently. That's an interesting case. What shall we do? We can:

- ignore it (also it would make sense to visually communicate it via the disabled button)
- cancel the previous request and launch a new one
- launch a new one and forget about previous. This is basically what we did in "classical" approach, but this is also will lead to a situation (7) which is a race condition. Also, this approach introduces race condition in (1, 5) and (1, 4) scenarios.

For this post, I selected to ignore it, as the simplest solution, maybe I will implement cancel in the in the next post.

This is why you want to use FSM, this approach helps to find "holes" in logic. And the more states there are in the system, the more potential holes are hidden in there.

If you think this is too much trouble to find those types of bugs, think of the typical IT support question: "Have you tried to turning it off and on again?". Yep, there is somewhere state related bug hidden and the way out is to restart the system to reset the state to initial state.

On the other side, I would agree JS (or Flow or TS) syntax is a bit clumsy for this kind of task. Pattern matching with the switch is not expressive. Redux requires even more boilerplate than traditionally.
