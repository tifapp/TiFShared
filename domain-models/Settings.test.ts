import { toggleSettingsTriggerId } from "./Settings"

describe("Settings tests", () => {
  describe("ToggleSettingsTriggerID tests", () => {
    it("should filter the trigger from the set if toggle value is false", () => {
      const triggers = toggleSettingsTriggerId(
        ["hello", "world"],
        "hello",
        false
      )
      expect(triggers.includes("hello")).toEqual(false)
    })

    it("should add the trigger to the set if toggle value is true", () => {
      const triggers = toggleSettingsTriggerId(["world"], "hello", true)
      expect(triggers.includes("hello")).toEqual(true)
    })

    it("should not add the trigger if the toggle value is true and the trigger is already in the set", () => {
      const triggers = toggleSettingsTriggerId(["hello"], "hello", true)
      expect(triggers).toEqual(["hello"])
    })
  })
})
