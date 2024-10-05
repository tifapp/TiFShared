/**
 * Capitalizes the first letter of the given string.
 *
 * @param str The string to capitalize.
 */
export const capitalizeFirstLetter = <S extends string>(str: S) => {
  if (str === "") return "" as Capitalize<S>
  return (str[0].toUpperCase() + str.slice(1)) as Capitalize<S>
}

const WHITESPACE_REGEX = /\s/

/**
 * Returns true if the character of the given string at `index` is a
 * whitespace character.
 *
 * @param str A string.
 * @param index The index of the character to check in `str`.
 */
export const isWhitespaceCharacter = (str: string, index: number) => {
  return WHITESPACE_REGEX.test(str[index])
}

const NON_DIGIT_REGEX = /\D/g

/**
 * Extracts a numerical string of all the numbers in this string.
 *
 * @param str A string.
 */
export const extractNumbers = (str: string) => {
  return str.replace(NON_DIGIT_REGEX, "") as `${number}` | ""
}

/**
 * An interface reprsenting types that have a callable `toString` method.
 */
export interface ToStringable {
  toString(): string;
}

/**
 * An interface reprsenting types that can be interpolated to url params.
 */
export interface URLParameterConstructable {
  toURLParameter(): string
}
