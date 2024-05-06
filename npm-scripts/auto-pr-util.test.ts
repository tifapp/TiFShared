import { getRawIdFromTicketId, getTicketId } from "./auto-pr-util";

describe("Auto PR Script Tests", () => {
  describe('getTicketId', () => {
    it('returns the provided ticket ID without searching the branch name', async () => {
      const currentBranch = 'feature/TASK_999-implement-x';
      const ticketId = 'TASK_123';
      expect(getTicketId(currentBranch, ticketId)).toBe(ticketId);
    });
    
    it('extracts and returns the ticket ID from the branch name when invalid ticket ID is provided', async () => {
      const currentBranch = 'feature/TASK_456-implement-y';
  
      expect(getTicketId(currentBranch, "invalidticketid")).toBe('TASK_456');
    });
  
    it('extracts and returns the ticket ID from the branch name when no ticket ID is provided', async () => {
      const currentBranch = 'feature/TASK_456-implement-y';
  
      expect(getTicketId(currentBranch)).toBe('TASK_456');
    });
  
    it('returns undefined and logs appropriate message when no ticket ID is found and none is provided', async () => {
      const currentBranch = 'feature/implement-z';
      expect(getTicketId(currentBranch)).toBeUndefined();
    });
  })

  describe('getRawIdFromTicketId', () => {
    it('extracts the ticket ID when it is at the beginning of the string', () => {
      const ticketId = 'TASK_123-bug-fix';
      expect(getRawIdFromTicketId(ticketId)).toBe('123');
    });
  
    it('extracts the ticket ID when it is at the end of the string', () => {
      const ticketId = 'Fix-the-critical-bug-TASK_123';
      expect(getRawIdFromTicketId(ticketId)).toBe('123');
    });
  
    it('is case insensitive when matching the ticket ID', () => {
      const ticketId = 'fix-the-critical-bug-task_123';
      expect(getRawIdFromTicketId(ticketId)).toBe('123');
    });
  
    it('returns null without a matching ticket ID', () => {
      const ticketId = 'Fix-the-critical-bug';
      expect(getRawIdFromTicketId(ticketId)).toBe(null);
    });
  })
})