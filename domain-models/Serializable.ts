import { ToStringable } from "lib/String";

/**
 * Domain models that can be easily serialized to strings
 */
export abstract class Serializable implements ToStringable {
  abstract toString(): string;

  toJSON() {
    return this.toString();
  }
}