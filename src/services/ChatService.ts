// ChatService — abstract interface between screens and the API layer.
// Screens call these methods; they never touch HTTP directly.

import type {
  ChatwootProfile,
  ChatwootConversation,
  ChatwootMessage,
  ChatwootContact,
  ChatwootLabel,
  ChatwootAgent,
  ChatwootInbox,
  ChatwootSendMessagePayload,
  ConversationStatus,
  ChatwootTeam,
  ChatwootTemplate,
  ChatwootReportSummary,
  ChatwootAgentReport,
  AvailabilityStatus,
} from '../types/chatwoot';
import type { ConversationFilters } from '../types/app';

export interface LoginResult {
  profile: ChatwootProfile;
}

export abstract class ChatService {
  abstract login(chatwootUrl: string, apiToken: string): Promise<LoginResult>;

  abstract getConversations(
    filters: Partial<ConversationFilters>,
    page?: number
  ): Promise<ChatwootConversation[]>;

  abstract getConversation(id: number): Promise<ChatwootConversation>;

  abstract getMessages(conversationId: number, before?: number): Promise<ChatwootMessage[]>;

  abstract sendMessage(
    conversationId: number,
    payload: ChatwootSendMessagePayload
  ): Promise<ChatwootMessage>;

  // Send an image or file attachment
  abstract sendAttachment(
    conversationId: number,
    fileUri: string,
    fileName: string,
    mimeType: string,
    isPrivate?: boolean
  ): Promise<ChatwootMessage>;

  abstract deleteMessage(conversationId: number, messageId: number): Promise<void>;

  abstract toggleStatus(
    conversationId: number,
    status: ConversationStatus
  ): Promise<void>;

  abstract setLabels(conversationId: number, labels: string[]): Promise<string[]>;

  abstract searchContacts(query: string): Promise<ChatwootContact[]>;

  abstract getContact(id: number): Promise<ChatwootContact>;

  // Conversations for a specific contact
  abstract getContactConversations(contactId: number): Promise<ChatwootConversation[]>;

  abstract getLabels(): Promise<ChatwootLabel[]>;

  abstract getCannedResponses(
    query?: string
  ): Promise<Array<{ id: number; short_code: string; content: string }>>;

  // ── Phase 4 additions ──────────────────────────────────────

  abstract getAgents(): Promise<ChatwootAgent[]>;

  abstract getTeams(): Promise<ChatwootTeam[]>;

  abstract getInboxes(): Promise<ChatwootInbox[]>;

  // Assign conversation to an agent (agentId=0 means unassign)
  abstract assignConversation(conversationId: number, agentId: number): Promise<void>;

  // Assign conversation to a team (teamId=0 means unassign)
  abstract assignTeam(conversationId: number, teamId: number): Promise<void>;

  abstract getTemplates(inboxId: number): Promise<ChatwootTemplate[]>;

  abstract getReportsSummary(): Promise<ChatwootReportSummary>;

  abstract getAgentReports(): Promise<ChatwootAgentReport[]>;

  // Update the current agent's availability status
  abstract updateAvailability(status: AvailabilityStatus): Promise<void>;
}
