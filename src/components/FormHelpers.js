// @flow
import React, { type Node } from "react";
import type { BFChildren } from "./BabyFormik";

type InputProps<T> = {|
  ...BFChildren<T>,
  type: "text" | "date",
  name: $Keys<T>
|};
export const Input = <T: {[string]: mixed}>({
  name,
  type,
  errors,
  touched,
  values,
  handleBlur,
  handleChange
}: InputProps<T>) => (
  <div>
    <input
      type={type}
      name={name}
      onChange={handleChange}
      onBlur={handleBlur}
      value={values[name]}
    />
    {errors[name] && touched[name] && errors[name]}
  </div>
);

export const Submit = <T>({ prefetchIfValid }: BFChildren<T>) => (
  <div className="buttonArea" onMouseEnter={prefetchIfValid}>
    <button type="submit">Search</button>
  </div>
);

type FormProps<T> = {|
  ...BFChildren<T>,
  children: Node
|};
export const Form = <T: {}>({ handleSubmit, children }: FormProps<T>) => (
  <form onSubmit={handleSubmit}>{children}</form>
);
