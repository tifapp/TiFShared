process.env.API_GENERATION_ENVIRONMENT = 'true';

import "../index";

import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi
} from "@asteasolutions/zod-to-openapi";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { APISchema, TiFAPISchema } from "../api";

extendZodWithOpenApi(z)

const registry = new OpenAPIRegistry()

Object.entries(TiFAPISchema as APISchema).forEach(
  ([, endpointSchema]) => {
    const { httpRequest: { method, endpoint }, input: { body, query, params }, outputs } = endpointSchema

    registry.registerPath({
      method: method.toLowerCase() as Lowercase<typeof method>,
      path: `${endpoint.replace(/:(\w+)/g, "{$1}")}`,
      request: {
        // TODO patch so "coerce" doesnt give isnullable=true
        // TODO Add headers
        // headers: z.object({
        //   Authorization: z.string().openapi({ example: "1212121" })
        // }),
        params,
        query,
        body: body
          // eslint-disable-next-line multiline-ternary
          ? {
            // TODO: Add descriptions
            content: {
              "application/json": {
                schema: body
              }
            }
          } : undefined
      },
      responses: Object.keys(outputs).reduce((acc, key) => {
        const statusCode = key.replace("status", "")

        acc[statusCode] = statusCode === "204"
          // eslint-disable-next-line multiline-ternary
          ? { description: "No Content" } : {
            description: "Object with user data.", // TODO: Add descriptions
            content: {
              "application/json": {
                schema: outputs[key]
              }
            }
          }

        return acc
      }, {}),
    })
  }
)

const generator = new OpenApiGeneratorV3(registry.definitions)

const specs = generator.generateDocument({
  openapi: "3.0.1",
  info: {
    title: "tifRestAPI",
    description: "API used for the TiF mobile app",
    version: `0.1` // TODO: Generate new version numbers
  },
  servers: [{
    url: `{apiEndpoint}/{environment}`,
    variables: {
      environment: {
        default: "staging",
        enum: ["stagintTest", "staging", "production"]
      },
      apiEndpoint: {
        default: "URL_GOES_HERE"
      }
    }
  }]
})

const filePath = path.join(__dirname, "../specs.json")
fs.writeFileSync(filePath, JSON.stringify(specs, null, 2))

console.log("Generated api specs successfully!")
