// @flow
import React from "react";
import ReactDOM from "react-dom";
import "normalize.css/normalize.css";
import "./index.css";
import App from "./App";
// import registerServiceWorker from './registerServiceWorker';

const root = document.getElementById("root");
if (!root) throw new Error("Can not find root");
ReactDOM.render(<App />, root);
// registerServiceWorker();
