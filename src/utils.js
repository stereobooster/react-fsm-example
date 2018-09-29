// @flow
export const exhaustiveCheck = (value: empty) => {
  throw new Error(`Unhandled value: ${value}`)
}
