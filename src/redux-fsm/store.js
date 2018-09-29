// @flow
import { createStore, compose, type Store } from "redux";
import { install, type StoreCreatorExplicit } from "redux-loop";
import { type State, defaultState } from "./state";
import reducer, { type Actions } from "./reducers";

let enhancer = compose(install());
let enhancedCreateStore: StoreCreatorExplicit<State, Actions>;
// $FlowFixMe hack for redux-loop types to work
enhancedCreateStore = createStore;

/* istanbul ignore if  */
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  enhancer = compose(
    install(),
    window.__REDUX_DEVTOOLS_EXTENSION__({
      serialize: {
        options: true
      }
    })
  );
}

export const initStore = (
  initialState: State = defaultState
): Store<State, Actions> => {
  const store = enhancedCreateStore(reducer, initialState, enhancer);
  /* istanbul ignore if  */
  if (process.env.NODE_ENV !== "production") {
    // $FlowFixMe this is webpack specific
    if (module.hot) {
      module.hot.accept("./reducers", () => {
        store.replaceReducer(reducer);
      });
    }
  }
  return store;
};
