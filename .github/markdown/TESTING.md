# Running tests

First of all, install devDependencies.

-   `npm install`

Then, simply let mocha do what it does best.

-   `npm test`

# Creating your own tests

In order to create your own tests, take a look at the existing [test files](https://github.com/Fronvo/server/tree/master/src/test).

As you can see, there exist a handful of helper functions for assertion, located in [test utilities](https://github.com/Fronvo/server/blob/master/src/test/utilities.ts) such as [assertCode](https://github.com/swc-project/swc-node).

Simply take a look at the rest of the tests and imitate their behaviour.

# Example

For reference take a look at the following steps where we will be testing the `isLoggedIn` event.

## Check the event file that you want to test

In this case, [this](https://github.com/Fronvo/server/blob/master/src/events/general/isLoggedIn.ts) is the event file code.

If we examine it, we can see it returns a boolean within the loggedIn key which indicates the logged in state.

```ts
return { loggedIn: isSocketLoggedIn(socket) };
```

## Create the test file

First things first, create a test file according to the function's access state, in this case [general](https://github.com/Fronvo/server/tree/master/src/test/general).

Then simply create the test file with the same name as the event as in: `isLoggedIn.test.ts` inside of the specific state folder.

## Create test cases

Now, lets create some test cases.

Since the `isLoggedIn` event only returns a value, regardless of external conditions, it will be a very simple, single test case.

First, create the main test function, which will take the given parameters from the [main test file](https://github.com/Fronvo/server/blob/master/src/test/main.ts#L49).

```ts
import { TestArguments, TestErrorCallback } from 'interfaces/test';
import { assertEquals, assertError, assertErrors } from 'test/utilities';
function isLoggedIn(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit('isLoggedIn', ({ err, loggedIn }) => {
        callback(assertError({ err }));
        callback(assertEquals({ loggedIn }, true));
        done();
    });
}
```

Then, simply export the function alongside an error-tracking utility.

```ts
export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, isLoggedIn);
};
```

We don't need any additional error-checking functions so we just pass the given test arguments alongside the final function.

**__And that's it!__**

Feel free to experiment with existing test files but before submitting a new test make sure to check if it exists.

Otherwise, feel free to [PR](https://github.com/Fronvo/server/pulls) your creation or [suggest](https://github.com/Fronvo/server/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement) that someone make it!

# Demo

<img src='https://raw.githubusercontent.com/Fronvo/server/master/.github/assets/demo-run-tests.svg' alt='Fronvo demo tests run'>
