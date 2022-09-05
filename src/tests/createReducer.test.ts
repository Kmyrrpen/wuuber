import { Action } from '../createAction';
import { createDispatch, Flow } from '../createDispatch';
import { createReducer } from '../createReducer';

describe(createReducer, () => {
  test('actions are typed correctly', () => {
    const reducer = createReducer('meta', {
      strictNumber: (action: Action<number>) => {},
      strictString: (action: Action<string>) => {},
      optionalNumber: (action: Action<number | undefined>) => {},
      emptyPayload: (action: Action<void>) => {},
      anythingGoes: (action: Action<any>) => {},
    });

    const {
      strictNumber,
      anythingGoes,
      emptyPayload,
      optionalNumber,
      strictString,
    } = reducer.actions;

    anythingGoes();
    emptyPayload();
    strictNumber(1);
    optionalNumber();
    optionalNumber(2);
    strictString('a');
    strictString('b');

    // @ts-expect-error
    strictNumber('a');
    // @ts-expect-error
    strictString(1);

    expect(anythingGoes().type).toBe("meta/anythingGoes");
    expect('types checked').toBeTruthy();
  });

  test('reducers are ran correctly within dispatch', () => {
    let store: string[] = [];
    const reducer = createReducer({
      increment: () => {
        store.push('-increment-');
      },
      decrement: () => {
        store.push('-decrement-');
      },
    });

    const flowStart: Flow = (action, next) => {
      store.push('-start-');
      return next(action);
    };

    const flowEnd: Flow = (action, next) => {
      store.push('-end-');
      return next(action);
    };

    const { increment, decrement } = reducer.actions;
    const dispatch = createDispatch(flowStart, reducer, flowEnd);
    dispatch(increment());
    expect(store.join('')).toBe('-start--increment--end-');
    store = [];
    dispatch(decrement());
    expect(store.join('')).toBe('-start--decrement--end-');
  });
});
