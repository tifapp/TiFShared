import { colorWithOpacity } from "../lib/Color"
import { z } from "zod"

/**
 * An easy way to manipulate characteristics of color strings (Alpha, RGB, etc.).
 */
export class ColorString {
  private readonly rgbHexString: string
  readonly opacity: number

  private constructor(rgbaHexString: string, opacity: number) {
    this.rgbHexString = rgbaHexString
    this.opacity = opacity
  }

  /**
   * Returns a new {@link ColorString} instance with the set opacity.
   *
   * @param value a number in the range from 0 to 1
   */
  withOpacity(value: number) {
    return new ColorString(this.rgbHexString, value)
  }

  /**
   * Outputs this string in hex omitting the alpha if `opacity` is 1.
   */
  toString() {
    return colorWithOpacity(this.rgbHexString, this.opacity)
  }

  toJSON() {
    return this.toString()
  }

  private static RGB_HEX_STRING_LENGTH = 7
  private static REGEX = /^#([a-f0-9]{2}){3,4}$/i

  /**
   * Parses a color string from a hex rgb or rgba string.
   *
   * Ex.
   *
   * `#aabbcc -> ✅`
   *
   * `#123456aa -> ✅`
   *
   * `#123456AA -> ✅` (Case insensitive)
   *
   * `123456AA -> 🔴` (Needs #)
   */
  static parse(hexString: string) {
    if (!ColorString.REGEX.test(hexString)) return undefined
    const opacityHex = hexString.slice(ColorString.RGB_HEX_STRING_LENGTH)
    return new ColorString(
      hexString.substring(0, ColorString.RGB_HEX_STRING_LENGTH),
      hexString.length === ColorString.RGB_HEX_STRING_LENGTH
        ? 1
        : parseInt(opacityHex, 16) / 255
    )
  }
}

/**
 * A zod schema for {@link ColorString}.
 */
export const ColorStringSchema = z.optionalParseable(
  ColorString,
  z.string().transform((rawValue) => {
    const parsedValue = ColorString.parse(rawValue)

    if (!parsedValue) {
      throw new Error("Invalid hex color string.")
    }

    return parsedValue
  })
)
