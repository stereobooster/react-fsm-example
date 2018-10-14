// @flow
import React, { Component, type Node } from "react";

// General type to describe form
type ToString = () => string;
type ToBoolean = () => boolean;
export type BFValues<T> = $ObjMap<T, ToString>;
export type BFErrors<T> = $Shape<$ObjMap<T, ToString>>;
type BFTouched<T> = $Shape<$ObjMap<T, ToBoolean>>;
type BFState<T> = {|
  values: BFValues<T>,
  errors: BFErrors<T>,
  touched: BFTouched<T>,
  isSubmitting: boolean
|};
export type BFValidate<T> = (values: BFValues<T>) => [BFErrors<T>, T | void];

// as of now consider only date input,
// but also should include select, checkbox and other
const isDiscrete = (type: string) => type === "date";

export type BFChildren<T> = {|
  ...BFState<T>,
  handleSubmit: (e: SyntheticEvent<HTMLInputElement>) => void,
  handleChange: (e: SyntheticEvent<HTMLInputElement>) => void,
  handleBlur: (e: SyntheticEvent<HTMLInputElement>) => void,
  prefetchIfValid: () => void
|};

export type BFProps<T> = {
  submit: T => void,
  prefetch: T => void,
  initialValues: BFValues<T>,
  validate: BFValidate<T>,
  children: (BFChildren<T>) => Node
};

export default class BabyFormik<T: {}> extends Component<
  BFProps<T>,
  BFState<T>
> {
  constructor(props: BFProps<T>) {
    super(props);
    this.state = {
      values: props.initialValues,
      errors: {},
      touched: {},
      isSubmitting: false
    };
  }
  handleSubmit = (e: SyntheticEvent<HTMLInputElement>) => {
    e.preventDefault();
    const [errors, form] = this.props.validate(this.state.values);
    if (form) {
      this.setState({ isSubmitting: true });
      this.props.submit(form);
    } else {
      this.setState({
        errors,
        touched: Object.keys(errors).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        )
      });
    }
  };
  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    // $FlowFixMe - EventTarget interface is empty object
    const { name, value, type } = e.target;
    const values: BFValues<T> = {
      ...this.state.values,
      [name]: value
    };
    this.setState({ values });
    if (isDiscrete(type)) {
      // $FlowFixMe BFValues<T1> != BFValues<T2>
      this.validateAndPrefetch(values);
    }
  };
  handleBlur = (e: SyntheticEvent<HTMLInputElement>) => {
    // $FlowFixMe - EventTarget interface is empty object
    const { name, type } = e.target;
    const [errors, form] = this.props.validate(this.state.values);
    this.setState({
      touched: {
        ...this.state.touched,
        [name]: true
      },
      errors
    });
    if (!isDiscrete(type)) if (form) this.props.prefetch(form);
  };
  validateAndPrefetch = (values: BFValues<T>) => {
    const [errors, form] = this.props.validate(values);
    if (form) this.props.prefetch(form);
  };
  prefetchIfValid = () => {
    // Flow gives up here and believes BFValues<T1> != BFValues<T2>
    // which is generally true, but not in this case because
    // T1 == T2 == T
    // $FlowFixMe
    this.validateAndPrefetch(this.state.values);
  };
  render() {
    const { handleSubmit, handleChange, handleBlur, prefetchIfValid } = this;
    return this.props.children({
      ...this.state,
      handleSubmit,
      handleChange,
      handleBlur,
      prefetchIfValid
    });
  }
}
