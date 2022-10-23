# wuuber

a small set of type-safe utility functions to create action-based logic.

## createDispatch
createDispatch will call the first function given and pass the second function as the `next` argument and so on and so forth.

A flow function has two arguments, `action`, and `options` that include a `next` function and `dispatch` function that calls the chain again. Calling `next` will call the next flow function in the chain, `dispatch` is the first flow function.

```ts
const first: Flow = (action, { next }) => {
  console.log("first");
  return next(action);
};

const second: Flow = (action, { next }) => {
  console.log("second");
  return next(action);
};

const dispatch = createDispatch(first, second);
```

## createAction
creates a function that creates actions with the given type attached.

```ts
const shake = createAction("shake");
const action = shake();

console.log(action.type) // "shake"
```

can also be passed a type for the payload

```ts

const shake = createAction("shake");
const action = shake(); // expects no payload by default.

const appendString = createAction<string>("appendString");
const action = appendString(); // ts will complain.

const increment = createAction<number | undefined>("increment");
const action = increment() // payload becomes optional.
```

You can also pass flow functions after passing the type and use it inside `createDispatch`,
functions created will only run when the dispatched action matches the type.

```ts
const pet = createAction("pet", (action, { next }) => {
  console.log("petting the doggo");
  return next(action);
})

const dispatch = createDispatch(pet);
dispatch(pet()) // will pet the doggo.
```

## createReducer

given an object of reducer functions, creates actions from those types and also use it inside dispatch.
Note that reducer functions only has one parameter which is the action, next and dispatch aren't given.

```ts
const catReducer = createReducer("cat", {
  purr: (action: Action<string>) => { console.log(action.payload) },
  scratch: (action) => { console.log("SCRATCH!") },
});

const { purr, scratch } = catReducer.actions;
const dispatch = createDispatch(catReducer);
const action = purr("cutely purrs");
console.log(action.type) // "cat/purr"
dispatch(purr("cutely purrs")); // logs "cutely purrs"
```

You can also just pass the object without a name argument
```ts
const reducer = createReducer({
  doSomething: () => {}
})

reducer.actions.doSomething().type // "doSomething"
```