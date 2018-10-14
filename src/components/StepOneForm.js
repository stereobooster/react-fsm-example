// @flow
import React, { Component } from "react";
import type { FruitForm } from "src/types";
import format from "date-fns/format";
import parse from "date-fns/parse";
import BabyFormik, { type BFValidate } from "./BabyFormik";
import { Input, Submit, Form } from "./FormHelpers";

// some date functions
const today = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};
const isValidDate = date => date instanceof Date && !isNaN(date);

// this is ugly code to imitate what io-ts can do
const validate: BFValidate<FruitForm> = values => {
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
const formToValues = (form: FruitForm | void) =>
  form
    ? {
        name: form.name,
        start: format(form.start, "YYYY-MM-DD")
      }
    : {
        name: "",
        start: ""
      };

type Props = {
  submit: FruitForm => void,
  prefetch: FruitForm => void,
  form: FruitForm | void
};

class StepOne extends Component<Props, {}> {
  render() {
    return (
      <BabyFormik
        validate={validate}
        prefetch={this.props.prefetch}
        submit={this.props.submit}
        initialValues={formToValues(this.props.form)}
      >
        {options => (
          <Form {...options}>
            <Input type="text" name="name" {...options} />
            <Input type="date" name="start" {...options} />
            <Submit {...options} />
          </Form>
        )}
      </BabyFormik>
    );
  }
}

export default StepOne;
