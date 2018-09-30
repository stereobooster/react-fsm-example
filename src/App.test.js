import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import { initStore } from "src/redux";
import App from "./App";

const store = initStore();

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={store}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
