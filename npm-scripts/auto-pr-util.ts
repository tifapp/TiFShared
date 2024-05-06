export const getRawIdFromTicketId = (ticketId: string) => {
    const match = ticketId.match(/(?<=task_)\w+/i);
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
            console.log("Card ID found in branch name")
        }
    }

    if (!rawId) {
        console.log("No linked card ID found.")
    }

    return rawId ? `TASK_${rawId}` : undefined
}