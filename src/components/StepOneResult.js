// @flow
import React from "react";
import { type State } from "src/redux";
import { exhaustiveCheck } from "src/utils";
import Spinner from "./Spinner";

export default ({ state }: { state: State }) => {
  switch (state.state) {
    case "initial":
      return "You will see result as soon as you submit form";
    case "fruit_loading":
      return <Spinner />;
    case "fruit_error":
      return "error, try again";
    case "fruit_ok":
      return (
        state.resonse &&
        state.resonse.map(item => (
          <li key={item.name}>
            {item.name} {item.price} {item.currency}
          </li>
        ))
      );
    default:
      exhaustiveCheck(state.state);
      return null;
  }
};
