import { Action, createAction } from '../createAction';
import { createDispatch, Flow } from '../createDispatch';

function makeshiftStore() {
  const order = ['-start-'];
  const flow1: Flow = (action: Action, next) => {
    order.push('-1-');
    return next(action);
  };
  const flow2: Flow = (action: Action, next) => {
    order.push('-2-');
    return next(action);
  };
  const flow3: Flow = (action: Action, next) => {
    order.push('-3-');
    return next(action);
  };

  return {
    order,
    flows: [flow1, flow2, flow3],
  };
}

const exampleAction = { type: 'fake-type', payload: '' };

describe(createDispatch, () => {
  test('dispatch calls all flows given in order', () => {
    const { order, flows } = makeshiftStore();
    const dispatch = createDispatch(...flows);

    dispatch(exampleAction);
    expect(order.join('')).toBe('-start--1--2--3-');
  });

  test('dispatch handles objects that contain flows', () => {
    const { order, flows } = makeshiftStore();
    const actionWithFlow = createAction('fake-type', (action, next) => {
      order.push('-action-');
      next(action);
    });
    const flowMustNotRun = createAction('other-fake-type', (action, next) => {
      order.push('-NEVER-');
      next(action);
    });

    const dispatch = createDispatch(...flows, actionWithFlow, flowMustNotRun);
    dispatch(actionWithFlow());
    expect(order.join('')).toBe('-start--1--2--3--action-');
  });

  test('calling dispatch from the inside', () => {
    const { order, flows } = makeshiftStore();
    const actionToBeDispatched = createAction('dispatched inside');
    const willDispatch = createAction(
      'dispatch when match',
      (action, next, dispatch) => {
        order.push('-dispatched-');
        dispatch(actionToBeDispatched());
        return next(action);
      },
    );

    const flowEnd: Flow = (action, next) => {
      order.push('-end-');
      return next(action);
    };

    const rootDispatch = createDispatch(...flows, willDispatch, flowEnd);
    rootDispatch(willDispatch());
    expect(order.join('')).toBe(
      '-start--1--2--3--dispatched--1--2--3--end--end-',
    );
  });
});
