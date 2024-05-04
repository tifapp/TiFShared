import { execSync } from "child_process"
import dotenv from "dotenv"
import fetch from "node-fetch"
import open from "open"
import { z } from "zod"
import { getRawIdFromTicketId, getTicketId } from "./auto-pr-util"

dotenv.config()

const envVars = z
  .object({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    TRELLO_API_KEY: z.string(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    TRELLO_API_TOKEN: z.string()
  })
  .passthrough()
  .parse(process.env)

const getPRDetails = async (ticketId?: string) => {
  try {
    if (!ticketId) {
      throw new Error("No ticket ID found.")
    }
    const ticketDetailsUrl = `https://api.trello.com/1/cards/${getRawIdFromTicketId(ticketId)}?key=${envVars.TRELLO_API_KEY}&token=${envVars.TRELLO_API_TOKEN}`
    const response = await fetch(ticketDetailsUrl)
    if (!response.ok) {
      throw new Error(response.statusText || "Failed to fetch task details.")
    }
    const data = await response.json() as {name: string, desc: string}
    console.log("Found task details.")
    return { prTitle: encodeURIComponent(`${ticketId} ${data.name}`), prBody: encodeURIComponent(
      `${data.desc}\n\nTicket ID: ${ticketId}`
    )}
  } catch (error) {
    console.error(error.message)
    return { prTitle: undefined, prBody: undefined }
  }
}

const getGitRemoteUrl = () => {
  try {
    const stdout = execSync("git config --get remote.origin.url", { encoding: 'utf8' })
    return stdout.trim()
  } catch (error) {
    throw new Error("Error getting Git remote URL:", error)
  }
}

const getCurrentBranchName = () => {
  try {
    const stdout = execSync("git rev-parse --abbrev-ref HEAD", { encoding: 'utf8' })
    return stdout.trim()
  } catch (error) {
    throw new Error("Error getting current git branch:", error)
  }
}

let branchName = getCurrentBranchName()
const ticketId = getTicketId(branchName, process.argv.slice(2)[0])
const {prTitle = branchName, prBody = ""} = await getPRDetails(ticketId)

console.log("Opening PR form...")
open(`${getGitRemoteUrl()}/compare/development...${branchName}?expand=1&title=${prTitle}&body=${prBody}`)