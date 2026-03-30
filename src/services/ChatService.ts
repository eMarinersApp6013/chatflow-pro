// ChatService — abstract interface between screens and the API layer.
// Screens call these methods; they never touch HTTP directly.

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
}
