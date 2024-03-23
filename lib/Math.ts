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
  }
}

Math.degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180
Math.sin2 = (radians: number) => (1 - Math.cos(2 * radians)) / 2
Math.roundToDenominator = (num: number, denominator: number) => {
  return Math.round(num * denominator) / denominator
}
