import { logger } from "../logging/Logging.ts";

const log = logger("auto-pr-script")

export const getRawIdFromTicketId = (ticketId: string) => {
    const match = ticketId.match(/(?<=task_)\w+|(?<=trello\.com\/c\/)(\w+)(?=\/|\?|$)/i);
    return match ? match[0] : null;
};

export const getTicketId = (currentBranchName: string, ticketId?: string) => {
    let rawId;

    if (ticketId) {
        rawId = getRawIdFromTicketId(ticketId)
    }
    
    if (!rawId) {
        rawId = getRawIdFromTicketId(currentBranchName)
        if (rawId) {
            log.info("Card ID found in branch name")
        }
    }

    if (!rawId) {
        log.warn("No linked card ID found.")
    }

    return rawId ? `TASK_${rawId}` : undefined
}

export const getEnvPath = (args: string[]) => {
    const envIndex = args.indexOf('--env') + 1;
    if (envIndex > 0 && args[envIndex]) {
        log.info(`Using env file ${args[envIndex]}`)
        return args[envIndex]
    }
    return null;
}