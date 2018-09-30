# React example

## ToC

1. [Turn Redux into Finite State Machine with the help of types](https://github.com/stereobooster/react-fsm-example/tree/post-1)
2. Turn Redux into Finite State Machine vol. 2: side effects (this post)

## Finite State Machines and beyond

In the previous post, I talked about Finite State Machines as a way to reduce the number of the bugs, but the way it was implemented still leaves a room for some bugs.

It is possible to represent FSM with types more precise. We can describe pairs (aka tuples) of allowed transition, for example `type transitions = ['initial', 'SUBMIT_FRUIT'] | ['loading', 'SUBMIT_FRUIT_OK'] ...`, and use it to force correct transitions (not sure this is possible with Redux, but should be possible in general)

I described FSM with Harel statecharts notation (or something pretty close to it), but actually, haven't proved the correctness of it (with Alloy or TLA+ etc.). It can contain infinite loops, unreachable states, race conditions, and deadlocks - given example is pretty small, so probably it's ok, but for a bigger system, it is easy to miss something

JS Redux implementation is an approximation of what is described as FSM, for example, the side effect is triggered separately from dispatching action, and if the developer will forget to trigger it the user will be stuck in infinite loading state (also fetch by default doesn't have a timeout, so if developer will forget to add timeout with `Promise.race` user can stuck too)

So I would treat the described technique (in the first post) more as an analysis technique which helps to think about system states and transitions, and with more thorough analysis helps to prevent some bugs. To make it more robust to bugs it still needs some work.

One way to improve this is to make given implementation closer to described FSM, let's make sure that dispatched action always accompanied with appropriate side effects.

## Side effects as messages

There are different approaches to side effects in Redux, like redux-thunk, redux-saga, redux-observable. I guess, the issue here is that there is no "official" solution, that is why different approaches keep emerging. See:
- [Reducer Composition with Effects in JavaScrip](https://github.com/reduxjs/redux/issues/1528)
- [How can I represent “side effects” such as AJAX calls?](https://redux.js.org/faq/actions#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior)

I want to show you a pretty transparent approach to side effects (from my POV). We can create side effects in response to actions and to keep reducer pure instead of executing it, we can "serialize" it and pass, as a message, to the Redux middleware which will actually execute it for us. This is similar to what they do in Elm:

```ts
// new type signature of the reducer
const reducer = (State, Actions) => [State, SideEffect];

// and somewhere in the Redux middleware
const [newState, sideEffect] = reducer(state, action);
sideEffect.execute();
return newState;
```

We can use existing solution - [redux-loop](https://redux-loop.js.org/). It is already installed in my project, you can check the source code to see how it's done.

Here is how "side effect inside" reducer looks like:

```diff
-export const fruitSubmitSideEffect = (dispatch: Dispatch, form: FruitForm) => {
-  fruitRequest(form).then(
-    resonse => {
-      dispatch({
-        type: "SUBMIT_FRUIT_OK",
-        resonse
-      });
-    },
-    error => {
-      dispatch({
-        type: "SUBMIT_FRUIT_ERROR",
-        error
-      });
-    }
-  );
-};
...
     case "SUBMIT_FRUIT":
       switch (reduxState.state) {
         case "initial":
         case "fruit_error":
         case "fruit_ok":
-          return {
-            state: "fruit_loading",
-            form: action.form
-          };
+          return loop(
+            {
+              state: "fruit_loading",
+              form: action.form
+            },
+            Cmd.run(fruitRequest, {
+              successActionCreator: resonse => ({
+                type: "SUBMIT_FRUIT_OK",
+                resonse
+              }),
+              failActionCreator: error => ({
+                type: "SUBMIT_FRUIT_ERROR",
+                error
+              }),
+              args: [action.form]
+            })
+          );
```

## Write tests!

As I said, the provided technique for FSM is not enough to prove correctness (it will help you to spot some bugs, but not all of them). So it is a good idea to add tests (until we add more formalism).

The nice part is that all logic is encapsulated inside reducer and to test it there is no need to touch side effects at all. We still need to test side effects separately, but we don't need to couple "core" logic tests with side effects.

```js
it("changes state to loading and creates side effect", () => {
  const [state, effect] = reducer(undefined, {
    type: "SUBMIT_FRUIT",
    form: "form"
  });
  expect(state).toEqual({ form: "form", state: "fruit_loading" });
  expect(effect.simulate({ success: true, result: "response" })).toEqual({
    resonse: "response",
    type: "SUBMIT_FRUIT_OK"
  });
  expect(effect.simulate({ success: false, result: "error" })).toEqual({
    error: "error",
    type: "SUBMIT_FRUIT_ERROR"
  });
});
```

To do the test we didn't need to mock anything - not fetch, nor modules.

We can additionaly check what actual side effect will do (we need to do this once), and we can separately test side effect itself e.g.  `src/api/fruitRequest`:

```js
jest.mock("src/api/fruitRequest", () => ({
  fruitRequest: jest.fn(() => "mockedFruitRequest")
}));
it("creates side effect with fruitRequest", () => {
  const { fruitRequest } = require("src/api/fruitRequest");
  const [state, effect] = reducer(undefined, {
    type: "SUBMIT_FRUIT",
    form: { test: 123 }
  });
  expect(effect.func(...effect.args)).toEqual("mockedFruitRequest");
  expect(fruitRequest).toBeCalledWith({ test: 123 });
});
```

Isn't it neat?
