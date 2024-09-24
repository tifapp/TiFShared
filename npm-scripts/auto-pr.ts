import { execSync } from "child_process"
import dotenv from "dotenv"
import fetch from "node-fetch"
import open from "open"
import { z } from "zod"
import { addLogHandler, consoleLogHandler, logger } from "../logging/Logging.ts"
import { getEnvPath, getRawIdFromTicketId, getTicketId } from "./auto-pr-util.ts"

const log = logger("auto-pr-script")
addLogHandler(consoleLogHandler())

const envFilePath = getEnvPath(process.argv);

dotenv.config({ path: envFilePath || '.env' })

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
      throw new Error("No ticket ID found, cannot link task.")
    }
    const ticketDetailsUrl = `https://api.trello.com/1/cards/${getRawIdFromTicketId(ticketId)}?key=${envVars.TRELLO_API_KEY}&token=${envVars.TRELLO_API_TOKEN}`
    const response = await fetch(ticketDetailsUrl)
    if (!response.ok) {
      throw new Error(response.statusText || "Failed to fetch task details.")
    }
    const data = await response.json() as {name: string, desc: string}
    log.info(`Using details of task "${data.name}" for pull request description.`)
    return { prTitle: encodeURIComponent(`${data.name}`), prBody: encodeURIComponent(
      `${data.desc}\n\nTicket ID: ${ticketId}`
    )}
  } catch (error) {
    log.error(error.message)
    return { prTitle: undefined, prBody: undefined }
  }
}

const getGitRemoteUrl = () => {
  try {
    const stdout = execSync("git config --get remote.origin.url", { encoding: 'utf8' })
    return stdout.trim().replace(/\.git$/, '');
  } catch (error) {
    console.error("Error getting Git remote URL:")
    throw error
  }
}

const getCurrentBranchName = () => {
  try {
    const stdout = execSync("git rev-parse --abbrev-ref HEAD", { encoding: 'utf8' })
    return stdout.trim()
  } catch (error) {
    console.error("Error getting current git branch:")
    throw error
  }
}

const getBaseBranch = () => {
  const branchesToCheck = ["development", "main", "master"];

  for (const branch of branchesToCheck) {
      try {
          execSync(`git rev-parse --verify ${branch}`, { stdio: 'ignore' });
          log.info(`Using ${branch} as the base.`)
          return branch;
      } catch (error) {
          log.info(`${branch} branch not found.`)
      }
  }

  throw new Error("No matching base branch found.");
}

let branchName = getCurrentBranchName()
const ticketId = getTicketId(branchName, process.argv[process.argv.length - 1])
const {prTitle = branchName, prBody = ""} = await getPRDetails(ticketId)
const repoUrl = getGitRemoteUrl()

log.info(`Opening PR form for ${repoUrl}...`)
open(`${repoUrl}/compare/${getBaseBranch()}...${branchName}?expand=1&title=${prTitle}&body=${prBody}`)