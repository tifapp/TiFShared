export {} // NB: Needed for global declaration

declare global {
  export interface Math {
    /**
     * Converts degrees to radians.
     */
    degreesToRadians(degrees: number): number

    /**
     * Trig identity for sin^2(x)
     *
     * @param x radians
     */
    sin2(radians: number): number

    /**
     * Rounds to the nearest fractional denominator. (eg. 2 -> 0.5, 3 -> 0.334)
     */
    roundToDenominator(num: number, denominator: number): number

    /**
     * Returns `value` if it is between `min` and `max`, `min` if `value` is less than `min`, and
     * `max` if `value` is greater than `max`.
     */
    clamp(min: number, max: number, value: number): number
  }
}

Math.degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180
Math.sin2 = (radians: number) => (1 - Math.cos(2 * radians)) / 2
Math.roundToDenominator = (num: number, denominator: number) => {
  return Math.round(num * denominator) / denominator
}
Math.clamp = (min, max, value) => {
  return Math.min(Math.max(min, value), max)
}
