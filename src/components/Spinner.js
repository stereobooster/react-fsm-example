// @flow
import React from "react";

type Props = { timeout?: number };
type State = { show: boolean };

export default class Spinner extends React.Component<Props, State> {
  static defaultProps = {
    timeout: 200
  };
  state = {
    show: false
  };
  timer: TimeoutID;
  componentDidMount() {
    this.timer = setTimeout(
      () => this.setState({ show: true }),
      this.props.timeout
    );
  }
  componentWillUnmount() {
    clearTimeout(this.timer);
  }
  render() {
    return this.state.show ? "Loading..." : null;
  }
}
