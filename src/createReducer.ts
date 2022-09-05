import { ActionCreator, createAction } from './createAction';
import { ContainsFlows, Flow, Next } from './createDispatch';

export type Reducer<T = any> = Next<T>;
type Reducers = { [key: string]: Reducer<any> };
type GetActionCreator<T> = T extends Reducer<infer PT>
  ? ActionCreator<PT>
  : never;
interface ReducerWithFlows<T extends Reducers> extends ContainsFlows {
  actions: { [key in keyof T]: GetActionCreator<T[key]> };
}

export function createReducer<T extends Reducers>(reducers: T): ReducerWithFlows<T>;
export function createReducer<T extends Reducers>(
  name: string,
  reducers: T,
): ReducerWithFlows<T>;
export function createReducer<T extends Reducers>(
  name: T | string,
  reducers?: T,
): any {
  const map: { [key: string]: Reducer } = {};
  const actions: { [key: string]: ActionCreator<any> } = {};
  
  const actualReducers = reducers || name;

  for (let entry of Object.entries(actualReducers)) {
    const [key, reducer] = entry;
    const newName = reducers ? `${name}/${key}` : key;

    map[newName] = reducer;
    actions[key] = createAction(newName);
  }

  const reducer: Flow = (action, next) => {
    if (map[action.type]) map[action.type](action);
    return next(action);
  };

  return {
    __flows: reducer,
    actions,
  };
}
