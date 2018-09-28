//  @flow
import { type State, defaultState } from "./state";

export type Actions = empty;

export default (state: State = defaultState, action: Actions) => state;
