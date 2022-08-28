import { Action, createAction } from '../createAction';
import { createDispatch } from '../createDispatch';

describe(createAction, () => {
  test('created action creators works properly', () => {
    const type = 'example-type';
    const payload = 'example-payload';
    const creator = createAction<string>(type);

    const exampleAction = creator(payload);
    const fakeAction: Action = { type: 'fake-type', payload: '' };

    expect(creator.type).toBe(type);
    expect(creator.match(exampleAction)).toBe(true);
    expect(creator.match(fakeAction)).toBe(false);
  });

  test('creating actions with varied payloads', () => {
    const emptyPayload = createAction('empty-type');
    const hasPayload = createAction<string>('payload-type');
    const optionalPayload = createAction<string | undefined>('optional-type');
    const anyPayload = createAction<any>('any-payload');

    emptyPayload(); // type EmptyPayload
    anyPayload(); // type OptionalPayload<any>
    hasPayload('string'); // type WithPayload<string>
    optionalPayload(); // type OptionalPayload<string | undefined>

    expect('types checked').toBeTruthy();
  });

  test('creating actions with flows attached to them', () => {
    let number = 0;
    const increment = createAction<number>(
      'number/increment',
      (action, next) => {
        number += action.payload;
        return next(action);
      },
    );

    const decrement = createAction<number>(
      'number/decrement',
      (action, next) => {
        number -= action.payload;
        return next(action);
      },
    );

    const multiIncrement = createAction<number>(
      'number/multiIncrement',
      (action, next) => {
        number += action.payload;
        return next(action);
      },
      (action, next) => {
        number += action.payload;
        return next(action);
      },
    );

    const dispatch = createDispatch(increment, decrement, multiIncrement);

    dispatch(increment(1));
    dispatch(increment(1));
    expect(number).toBe(2);

    dispatch(decrement(2));
    dispatch(decrement(10));
    expect(number).toBe(-10);

    dispatch(multiIncrement(5));
    dispatch(multiIncrement(10));
    expect(number).toBe(20);
  });
});
