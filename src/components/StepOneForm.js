// @flow
import React, { Component } from "react";
import type { FruitForm } from "src/types";
import { type StateState } from "src/redux";
import format from "date-fns/format";
import parse from "date-fns/parse";

// General type to describe form
type ToString = () => string;
type ToBoolean = () => boolean;
type ValuesT<T> = $ObjMap<T, ToString>;
type ErrorsT<T> = $Shape<$ObjMap<T, ToString>>;
type TouchedT<T> = $Shape<$ObjMap<T, ToBoolean>>;
type StateT<T> = {|
  values: ValuesT<T>,
  errors: ErrorsT<T>,
  touched: TouchedT<T>,
  isSubmitting: boolean
|};

// Exact types
type Values = ValuesT<FruitForm>;
type Errors = ErrorsT<FruitForm>;
type State = StateT<FruitForm>;

// some date functions
const today = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};
const isValidDate = date => date instanceof Date && !isNaN(date);

// as of now consider only date input,
// but also should include select, checkbox and other
const isDiscrete = (type: string) => type === "date";

// this is ugly code to imitate what io-ts can do
const validate = (values: Values): [Errors, FruitForm | void] => {
  const errors = {};
  let res = {};
  if (values.name.length <= 0) {
    errors.name = "Please provide fruit name";
  } else {
    res.name = values.name;
  }
  const startDate = parse(values.start);
  if (isValidDate(startDate)) {
    startDate.setHours(0, 0, 0, 0);
    if (startDate.getTime() < today().getTime()) {
      errors.start = "You can use today or later";
    } else {
      res.start = startDate;
    }
  } else {
    errors.start = "Please provide a date";
  }
  if (!res.name || !res.start) {
    // Left<Errors>
    return [errors, undefined];
  } else {
    // Right<FruitForm>
    return [{}, res];
  }
};

type Props = {
  submit: FruitForm => void,
  prefetch: FruitForm => void,
  stateState: StateState,
  form: void | FruitForm
};

class StepOne extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // this code cries for io-ts
    const values = props.form
      ? {
          name: props.form.name,
          start: format(props.form.start, "YYYY-MM-DD")
        }
      : {
          name: "", // "apple",
          start: "" // format(new Date(), "YYYY-MM-DD")
        };
    this.state = {
      values,
      errors: {},
      touched: {},
      isSubmitting: false
    };
  }
  handleSubmit = (e: SyntheticEvent<HTMLInputElement>) => {
    e.preventDefault();
    const [errors, form] = validate(this.state.values);
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
    // $FlowFixMe
    const { name, value, type } = e.target;
    const values = {
      ...this.state.values,
      [name]: value
    };
    this.setState({ values });
    if (isDiscrete(type)) this.validateAndPrefetch(values);
  };
  handleBlur = (e: SyntheticEvent<HTMLInputElement>) => {
    // $FlowFixMe
    const { name, type } = e.target;
    const [errors, form] = validate(this.state.values);
    this.setState({
      touched: {
        ...this.state.touched,
        [name]: true
      },
      errors
    });
    if (!isDiscrete(type)) if (form) this.props.prefetch(form);
  };
  validateAndPrefetch = (values: Values) => {
    const [errors, form] = validate(values);
    if (form) this.props.prefetch(form);
    return [errors, form];
  };
  render() {
    const { values, errors, touched } = this.state;
    const { handleSubmit, handleChange, handleBlur } = this;
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.name}
            />
            {errors.name && touched.name && errors.name}
          </div>
          <div>
            <input
              type="date"
              name="start"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.start}
            />
            {errors.start && touched.start && errors.start}
          </div>
          <div
            className="buttonArea"
            onMouseEnter={() => {
              this.validateAndPrefetch(this.state.values);
            }}
          >
            <button
              type="submit"
              disabled={this.props.stateState === "fruit_loading"}
            >
              Search
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default StepOne;
