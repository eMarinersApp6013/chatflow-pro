// ChatService — abstract interface between screens and the API layer.
// Screens call these methods; they never touch HTTP directly.
// ChatwootAdapter implements this for the Chatwoot backend.
// Future: DirectWAAdapter will implement the same interface for WhatsApp direct.

import type {
  ChatwootProfile,
  ChatwootConversation,
  ChatwootMessage,
  ChatwootContact,
  ChatwootLabel,
  ChatwootSendMessagePayload,
  ConversationStatus,
} from '../types/chatwoot';
import type { ConversationFilters } from '../types/app';

export interface LoginResult {
  profile: ChatwootProfile;
}

export abstract class ChatService {
  // Auth — validate credentials and get profile
  abstract login(chatwootUrl: string, apiToken: string): Promise<LoginResult>;

  // Conversations — list with filters, page for pagination
  abstract getConversations(
    filters: Partial<ConversationFilters>,
    page?: number
  ): Promise<ChatwootConversation[]>;

  // Single conversation detail
  abstract getConversation(id: number): Promise<ChatwootConversation>;

  // Messages — paginate backward with `before` message id
  abstract getMessages(conversationId: number, before?: number): Promise<ChatwootMessage[]>;

  // Send a text message or private note
  abstract sendMessage(
    conversationId: number,
    payload: ChatwootSendMessagePayload
  ): Promise<ChatwootMessage>;

  // Delete a message
  abstract deleteMessage(conversationId: number, messageId: number): Promise<void>;

  // Toggle conversation status (open → resolved → open)
  abstract toggleStatus(
    conversationId: number,
    status: ConversationStatus
  ): Promise<void>;

  // Assign conversation labels
  abstract setLabels(conversationId: number, labels: string[]): Promise<string[]>;

  // Contact search
  abstract searchContacts(query: string): Promise<ChatwootContact[]>;

  // Get contact by id
  abstract getContact(id: number): Promise<ChatwootContact>;

  // Get all labels for this account
  abstract getLabels(): Promise<ChatwootLabel[]>;

  // Canned responses
  abstract getCannedResponses(query?: string): Promise<Array<{ id: number; short_code: string; content: string }>>;
}
