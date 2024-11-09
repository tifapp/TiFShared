/**
 * Adjusts the opacity of the specified hex color.
 */
export const colorWithOpacity = (hexColor: string, opacity: number) => {
  "worklet"
  const opacityHexString =
    opacity === 1 ? "" : Math.ceil(255 * opacity).toString(16)
  return hexColor + opacityHexString
}
