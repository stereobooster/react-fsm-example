# React example

## ToC

1. [Redux as Finite State Machine](https://github.com/stereobooster/react-fsm-example/tree/post-1)
2. [Side effects in Redux](https://github.com/stereobooster/react-fsm-example/tree/post-2)
3. [Optimistic UI](https://github.com/stereobooster/react-fsm-example/tree/post-3)
4. [I created a monster](https://github.com/stereobooster/react-fsm-example/tree/post-4)

## New requirements

In each post, I add a new technological approach or new UX requirements and then solve it. This time I thought, it would be nice to unblock search button, while the request is pending, so the user can submit another search request without the need to wait while current one finishes.

Reminder: in the first post, we introduced FSM, but to simplify things I thought we don't want to think about race conditions and instead allowed only one search request at a time. Otherwise, there can be a situation when the user submits two requests, but the response for the first request arrives later than the second one:

```
 +---------------------------------------+
 |first request                          |
 +---------------------------------------+
        +----------------------+
        |second request        |
        +----------------------+
```

From the user point of view, the flow will be: submit the first search, the user sees loading state, submits the second request, the user sees loading state, next (two possible options):

- next user sees the result for the second request (no loading state), then suddenly sees the result for the first request
- next user sees the result for the first request

Both options are bad and to prevent this, we simplified the task by limiting the number of requests to one from FSM point of view:

```js
switch (action.type) {
  case "SUBMIT_FRUIT":
    switch (reduxState.state) {
      case "fruit_loading":
        return loop(reduxState, Cmd.none);
```

and from a UI point of view:

```js
<button type="submit" disabled={this.props.stateState === "fruit_loading"}>
  Search
</button>
```

Now I want to remove this limitation. Sounds simple, right?

## First attempt: cancel the previous request

So we do not allow more than one request at a time, and if we want to submit another request we can simply cancel the previous one. Seems straightforward, but because of previous decisions [code becomes unclear and tangled](https://github.com/stereobooster/react-fsm-example/pull/1/files).

First, I thought I created a monster, and write code like this is bad. Also, I question if this requirement would appear in real life in the first place, maybe I'm overcomplicating requirements. I thought, that this kind of task, probably trivial to solve with reactive libraries, like RxJS or cycle.js. But later I thought: wait, maybe there is another way?

## Second attempt: check if the result is the same as the current request

Another way to do this task is to allow more than one simultaneous request, but when the answer comes back (success or failure) check that the answer has the same params as the latest submitted request.

```js
case "SUBMIT_FRUIT_OK":
  if (!deepEqual(reduxState.form, action.form))
    return loop(reduxState, Cmd.none);
```

As you can see [second attempt](https://github.com/stereobooster/react-fsm-example/pull/2/files) much simpler.

## One more issue

We introduced a cache in the third post. Later I realized, that there is a bug. Errored fetch requests should be evicted from the cache immediately, otherwise in case of temporal error user can get stuck with error state for some time.

```js
result = baseFruitRequest(form).catch(e => {
  cache.delete(query);
  return Promise.reject(e);
});
```

## Is it worth it?

All that accidental complexity and the fact that some bugs sneak in made me question this approach.

This approach solves only some issues, as soon as we get out of "zone" of FSM and synchronous actions we still have to deal with some unobvious complexity (like the issue with cache).

The syntax of JS/Flow/TypeScript and used libs are not expressive enough, we still need a lot of boilerplate, I wonder if this code would be shorter in Elm.

But on the other side, I think that I'm tired of writing software in an old error-prone way, I want to find a better means to do it. And if this approach is not a final solution, it is at least make me closer to my target.

Maybe I will try to explore [Algebraic Effects](https://dev.to/yelouafi/algebraic-effects-in-javascript-part-1---continuations-and-control-transfer-3g88) next, maybe I will find a way to do type checking for it.
