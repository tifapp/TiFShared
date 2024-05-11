import { addLogHandler, resetLogHandlers } from "../logging";
import { getEnvPath, getRawIdFromTicketId, getTicketId } from "./auto-pr-util";

describe("Auto PR Script Tests", () => {
  const handler = jest.fn()
  addLogHandler(handler)
  
  afterAll(() => {
    resetLogHandlers();
    jest.restoreAllMocks();
  });
  
  describe('getTicketId', () => {
    it('returns the provided ticket ID without searching the branch name', async () => {
      const currentBranch = 'feature/TASK_999-implement-x';
      const ticketId = 'TASK_123';
      expect(getTicketId(currentBranch, ticketId)).toBe(ticketId);
      expect(handler).toHaveBeenCalledTimes(0);
    });
    
    it('extracts and returns the ticket ID from the branch name when invalid ticket ID is provided', async () => {
      const currentBranch = 'feature/TASK_456-implement-y';  
      expect(getTicketId(currentBranch, "invalidticketid")).toBe('TASK_456');
      expect(handler).toHaveBeenCalledWith("auto-pr-script", "info", "Card ID found in branch name", undefined);
    });
  
    it('extracts and returns the ticket ID from the branch name when no ticket ID is provided', async () => {
      const currentBranch = 'feature/TASK_456-implement-y'; 
      expect(getTicketId(currentBranch)).toBe('TASK_456'); 
      expect(handler).toHaveBeenCalledWith("auto-pr-script", "info", "Card ID found in branch name", undefined);
    });
  
    it('returns undefined and logs appropriate message when no ticket ID is found and none is provided', async () => {
      const currentBranch = 'feature/implement-z';
      expect(getTicketId(currentBranch)).toBeUndefined();
      expect(handler).toHaveBeenCalledWith("auto-pr-script", "warn", "No linked card ID found.", undefined);
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

  describe('getEnvPath', () => {  
    it('returns the path if --env is followed by a path', () => {
      expect(getEnvPath(['node', 'script.js', '--env', 'local.env'])).toBe('local.env');
      expect(handler).toHaveBeenCalledWith("auto-pr-script", "info", "Using env file local.env", undefined);
    });
  
    it('returns null if --env is not followed by a path', () => {
      expect(getEnvPath(['node', 'script.js', '--env'])).toBeNull();
    });
  
    it('returns null if --env argument is missing', () => {
      expect(getEnvPath(['node', 'script.js'])).toBeNull();
    });
  });  
})