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

### API

Our API Schema is codified in `api\TiFAPISchema.ts` and details the shape of inputs and outputs for all endpoints.

Endpoints conform to this pattern:

```
{
  [endpointName]: {
    input: {
      body?: ZodSchema,
      query?: ZodSchema,
      params?: ZodSchema
    },
    outputs: { //needs at least 1 output
      status200?: ZodSchema,
      status201?: ZodSchema,
      status204?: "no-content",
      ...etc
    },
    constraints: (input, output) => boolean, //throws a validation error if the function returns false (eg. checking if the input value matches the output value)
    httpRequest: {
      method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
      endpoint: "/{string}"
    }
  },
}
```

#### Adding Support for a new Endpoint

Support for new endpoints can be added to `TiFAPISchema` like so:

```ts
const TiFAPISchema = {
  // Other endpoints...

  myNewEndpoint: assertEndpointSchemaType({
    input: {
      params: {
        id: z.number()
      }
    },
    outputs: {
      status200: z.object({ value: z.string() }),
      status400: z.object({ other: z.number() })
    },
    httpRequest: {
      method: "POST",
      endpoint: "/my/new/endpoint/:id"
    }
  })

  // Other endpoints...
}
```

This is how they can be used, using the example endpoint we just added:

```ts
const foo = async (api: TiFAPI) => {
  const resp = await api.myNewEndpoint({params: {id: 1}}) // Typescript will confirm the shape of the request
  if (resp.status === 200) {
    // Type inferred to be the converted type of the schema for status200
    console.log(resp.data.value)
  } else {
    // Type inferred to be the converted type of the schema for status400
    console.log(resp.data.other)
  }
}
```

#### API Clients

The TiFAPISchema endpoints are converted to function types and stored in the `TiFAPI` type. 

API clients can be created using the `TiFAPIClientCreator()` function or by reducing the `TiFAPISchema`.

1. `TiFAPIClientCreator()`

- Creates a typesafe TiFAPI client with methods whose signatures match the endpoints described by the `TiFAPISchema`.

2. `APIMiddleware`

- Can be passed to `TiFAPIClientCreator()` to handle or transform the high-level requests and responses of the `TiFAPIClient`.

2a. `TiFAPITransport`

- An instance of `APIMiddleware` responsible for sending and retrieving data across the network via `fetch`.

3. API Extensions

- By default the API endpoint functions created using `TiFAPIClientCreator()` take in the requests described by the TiFAPISchema and can access additional contextual information like the endpoint name and endpoint schema itself. Additional contextual information can be inserted through `APIMiddleware` or requested by adding a type parameter to `TiFAPIClientCreator()`.

An example API client can be constructed as follows:

```ts

const apiClient = TiFAPIClientCreator<{signal?: AbortSignal}>(
  validateAPIClientCall,
  jwtMiddleware(async () => "My JWT token"), // inserts "{headers}" into the context, which can be accessed by subsequent middlewares.
  tifAPITransport(new URL("https://api.production.com"))
)

const controller = new AbortController()
apiClient.myNewEndpoint({params: {id: 1}, signal: controller.signal}) // apiClient now allows an AbortSignal to be passed for all endpoints in addition to the standard input.

```

#### API Testing

The `mockTiFServer()` and `mockTiFEndpoint()` test helpers can be used to quickly mock the TiF API and assert expected requests.

An example API mock can be constructed as follows:

```ts

test("endpoint", async () => {
  mockTiFServer({
    myNewEndpoint: {
      expectedRequest: { params: { id: 2 } },
      mockResponse: {
        status: 200,
        data: { trackableRegions: EXPECTED_ARRIVAL_REGIONS }
      }
    }
  })

  testAPI.myNewEndpoint({ params: { id: 1 } }) // will throw an expect error
})

```

```ts

test("endpoint", async () => {
  mockTiFEndpoint("myNewEndpoint", 404, { error: "event-not-found" })

  const response = await testAPI.myNewEndpoint({ params: { id: 1 } }) // response = { status: 404, { error: "event-not-found" } }
})

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
* Important: Package name is case-sensitive

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
