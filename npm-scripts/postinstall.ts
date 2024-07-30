import { execSync } from "child_process"

const isCI = process.env.CI === "true"

if (!isCI) {
  const command = "npm link TiFShared"
  console.log(command)
  execSync(command, { stdio: "inherit" })
}