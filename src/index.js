// @flow
import React from "react";
import ReactDOM from "react-dom";
import "normalize.css/normalize.css";
import "./index.css";
import App from "./App";
// import registerServiceWorker from './registerServiceWorker';
import { Provider } from "react-redux";
import { initStore } from "src/redux/store";

const root = document.getElementById("root");
if (!root) throw new Error("Can not find root");

const store = initStore();

const render = Component =>
  ReactDOM.render(
    <Provider store={store}>
      <Component />
    </Provider>,
    root
  );

render(App);

/* istanbul ignore if */
// $FlowFixMe this is webpack specific
if (module.hot) {
  module.hot.accept("src/App", () => {
    const NextApp = require("src/App").default;
    render(NextApp);
  });
}
// registerServiceWorker();
