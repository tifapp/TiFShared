# TiFShared

An extended standard library used at TiF.

## Usage

Make sure you import "TiFShared" in the root of any application you use this in. This ensures that all pollyfills and extensions are applied correctly.

```ts
import { thing } from "some-other-library"
import "TiFShared"

// Code to launch the app.
```

## Overview

This library contains 2 types of code:

1. Highly generic code.

- Known math formulas, string manipulation functions, common utility functions, etc.

2. Shared Domain Specific Models/Frameworks

- API Client, Logging, etc.

The first type of code can be found in the `lib` folder, and the second type of code can be found in the other folders of this library. Here's an overview of each folder in the library:

| Folder        | Overview                                               |
| ------------- | ------------------------------------------------------ |
| lib           | Contains common utility functions/highly generic code. |
| domain-models | Application specific shared models.                    |
| api           | API Client + Associated API Models.                    |
| logging       | A shared custom logging framework.                     |

## When and where should I add code to this library?

Since there a 2 types of shared code, there are naturally a few questions you'll need to ask yourself.

**Does the code target our primary problem domain?**

- _Yes_
  - **Does the code need to be shared, or should it belong on an already shared function/file/class/type?**
    - _Yes_
      - **Should it belong to a shared function/class/file/type?**
        - _Yes_
          - **_Put the code in the function/class/file/type._**
        - _No_
          - **Is the code a _new_ significant component (logging, API Client, etc.)?**
            - _Yes_
              - **_Put the code in a new folder in the root of this library_.**
            - _No_
              - **_Put the code in the proper folder._**
    - _No_
      - **_Don't put the code in this library._**
- _No_
  - **_Is the code super generic (like a common utility function)?_**
    - _Yes_
      - **_Put it in the appropriate place inside the lib folder (create a new file if neccessary)._**
    - _No_
      - **_Don't put the code in this library._**

## Core-Components

Here is an outline of some of the core components in this library.

### Extensions

Many languages contain the ability to add properties to already existing types
retroactively. For instance, in swift:

```swift
extension Numeric {
  var squared: Self { self * self }
}
let value = 2.squared // value == 4
```

This can also be done in typescript, however it's usually looked down upon due to the possibility of accidentially overwriting extension properties. For instance, say we have 2 libraries that extend the `Array` prototype:

```ts
// 3rd-Party Library
Array.prototype.foo = function () {
  // Code...
}

// Extensing the prototype allows the library to do this.
const arr = [].foo().foo().foo()

// Our code
Array.prototype.foo = function () {
  // BAD! We have now just broken foo from the 3rd party.
}

const foo = (arr: Array) => {
  // Safe, we have our own function.
}

const arr = foo(foo(foo([])))
```

Despite this downside, there are plenty of reasons to want extensions:

- Better discoverability
  - We don't need to know that a global `foo` function exists.
- Retroactive interface conformances
  - We can add extensions on an already existing type to make it conform to an interface that we define.

The extensions system in this library provides this benefit with the proper safety net. To add extension properties on an existing class, use the `prototypeExtension` function:

```ts
class Thing {
  foo() {}
}

prototypeExtension(Thing, { bar: (t) => t.foo() })
const thing = new Thing()
thing.foo() // Existing property is maintained.
thing.ext.bar() // All extensions are accessed via ext.

// Throws an error, bar is already on Thing.
prototypeExtension(Thing, { bar: () => "Nice" })

// Throws an error, foo is already on Thing.
prototypeExtension(Thing, { foo: () => "Nice" })

class Thing2 {
  ext() {}
}

// Throws an error, ext is already on Thing2.
prototypeExtension(Thing2, { foo: () => {} })
```

You can also do this on normal objects via `extension`:

```ts
const obj = { hello: () => "world" }
const extended = extension(obj, { world: () => "hello" })
extended.hello() // Existing property is maintained
extended.world()

// Throws an error, hello already exists on extended
extension(extended, { hello: () => 1 })
```

### Logging

We use a shared logging framework to allow logging to multiple destinations.

```ts
const log = logger("tif.read.me") // Each logger is assigned a label.
addLogHandler(consoleLogHandler()) // Enable console logging.

// Log messages can include additional metadata passed as an object.
log.info("Hello world", { meta: "data" })
```

It's possible to add multiple log destinations by creating a function that conforms to `LogHandler` and adding it via `addLogHandler`.

```ts
const customLogHandler = (
  label: string,
  level: LogLevel,
  message: string,
  metadata: object
) => {
  // Send these parameters somewhere
}

addLogHandler(customLogHandler)
```

The available log levels are `info`, `warn`, `trace`, `debug`, and `error`. Each of these levels are functions on the object returned from `logger`.

### API Client

This library houses our API client which is a class named `TiFAPI`. However, `TiFAPI` is merely a high-level wrapper class around the rest of the network stack. The lower level of the stack contains 2 primary components:

1. `TiFAPITransport`

- Responsible for sending data across the network via `fetch`, and validating responses against zod schemas.

2. `TiFAPIMiddleware`

- Responsible for transforming a network request (eg. adding a JWT to the Authorization header), and handling the low level response.

An example `TiFAPI` instance can be constructed as follows:

```ts
// jwtMiddleware comes with this library, you can also write your own middleware functions.
const middleware = jwtMiddleware(async () => "My JWT token")
const transport = tifAPITransport(
  new URL("https://api.production.com"),
  middleware
)
const api = new TiFAPI(transport)
```

### Adding Support for a new Endpoint

Whenever adding support for a new endpoint, it can be added to `TiFAPI` like so:

```ts
class TiFAPI {
  // Other endpoints...

  async myNewEndpoint(id: number, signal?: AbortSignal) {
    return await this.apiFetch(
      {
        method: "POST", // Also can be "POST", "PATCH", etc.
        endpoint: `/my/new/endpoint/${id}`,
        query: { query: "parameter" }, // All query paramaters are converted via their `toString` method.
        body: { body: "parameter" } // "GET" requests don't support a request body.
      },
      {
        // Each status code has a corresponding zod schema for the response body.
        status200: z.object({ value: z.string() }),
        status400: z.object({ other: z.number() })
      },
      signal // Optional, an AbortSignal to cancel the request.
    )
  }

  // Other endpoints...
}
```

You can then use the new endpoint like:

```ts
const foo = async (api: TiFAPI) => {
  const resp = await api.myNewEndpoint(1)
  if (resp.status === 200) {
    // Type inferred to be the converted type of the schema for status200
    console.log(resp.data.value)
  } else {
    // Type inferred to be the converted type of the schema for status400
    console.log(resp.data.other)
  }
}
```

## Local Development Setup

For developers working on the TiFShared package and test changes locally without republishing, the `npm link` command can be used. This command creates a symlink that points to the local development version of the package. Follow these steps to set up your development environment:

### Step 1: Link the Package Globally

Ensure the TiFShared package is installed locally, then navigate to the root directory of TiFShared:
```bash
cd TiFShared
```

Run the following command to create a global symlink:
```bash
npm link
```
This command makes the TiFShared package globally available on your machine, akin to having it installed as a global package.

### Step 2: Link the Package to Your Main Project

With the utils package globally linked, navigate to the root directory of your main project, i.e.:
```bash
cd ../FitnessProject
```

Then link the utils package to your main project:
```bash
npm link TiFShared
```

### Step 3: Verify the Link

To ensure the symlink was successfully created, you can check in the node_modules directory of your main project:

```bash
ls -l node_modules/your-utils-package-name
```

This command should show a link pointing to your utils package directory.

### Step 4: Using the Package

You can now use the utils package in your main project as if it were installed through npm:

```javascript
import "TiFShared";
```

### Step 5: Unlink When Done
When you no longer need the local development link, or if you wish to revert to the official version of the package:

Navigate back to your main project directory:

```bash
cd ../FitnessProject
```

Unlink the utils package:

```bash
npm unlink --no-save TiFShared
```

Or, go to the utils package directory to remove the global link:

```bash
cd path/to/your-utils-package
npm unlink
```

This will remove the global symlink and any project-specific links, effectively decoupling the local development setup.
Afterwards, you can npm install the remote version of the package if needed.

## Support + Contributing

Reach out on to Sean or Matthew on slack if you have any further questions, especially around whether or not to include code in this repo.
