import linkifyIt, { Validate } from "linkify-it"
import { ToStringable, isWhitespaceCharacter } from "./String"

/**
 * Returns a linkify {@link Validate} function that ensures that there is
 * whitespace before a schema passed to `linkify.add`.
 */
export const ensureWhitespaceBeforeSchemaValidator = (
  validate: (text: string, pos: number) => ToStringable | undefined
): Validate => {
  return (text, pos) => {
    const parsedValue = validate(text, pos)
    if (!parsedValue) return false
    if (pos >= 2 && !isWhitespaceCharacter(text, pos - 2)) {
      return false
    }
    return parsedValue.toString().length
  }
}

export const linkify = linkifyIt()
