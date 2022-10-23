import { Action } from './createAction';

export type Dispatch = (action: Action) => any;
export type Next<T = any> = (action: Action<T>) => any;
export type Flow<T = any> = (
  action: Action<T>,
  options: {
    next: Next;
    dispatch: Dispatch;
  },
) => any;
export type ContainsFlows = {
  __flows: Flow | Next | Flow[];
};

const containsFlows = (object: any): object is ContainsFlows => {
  return Boolean(object.__flows);
};

export function createDispatch(...flows: (Flow | ContainsFlows)[]) {
  let root: Next = (action) => action;
  const dispatch: Dispatch = (action) => root(action);

  const flattenedFlows = flows.flatMap((flow) => {
    return containsFlows(flow) ? flow.__flows : flow;
  });

  for (let i = flattenedFlows.length - 1; i >= 0; --i) {
    const temp = root;
    root = (action) => flattenedFlows[i](action, { next: temp, dispatch });
  }

  return dispatch;
}
