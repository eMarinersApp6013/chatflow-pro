// ChatwootAdapter — implements ChatService using the Chatwoot REST API.
// All HTTP calls are centralized here. No other file should call fetch directly.

import { ChatService, LoginResult } from './ChatService';
import { API } from '../constants/api';
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

export class ChatwootAdapter extends ChatService {
  private baseUrl: string = '';
  private apiToken: string = '';
  private accountId: number = 0;

  configure(baseUrl: string, apiToken: string, accountId: number): void {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiToken = apiToken;
    this.accountId = accountId;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        api_access_token: this.apiToken,
        ...options.headers,
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async login(chatwootUrl: string, apiToken: string): Promise<LoginResult> {
    const cleanUrl = chatwootUrl.replace(/\/$/, '');
    const res = await fetch(`${cleanUrl}${API.PROFILE}`, {
      headers: { 'Content-Type': 'application/json', api_access_token: apiToken },
    });
    if (!res.ok) throw new Error(`Login failed (${res.status}). Check URL and token.`);
    const profile = await res.json() as ChatwootProfile;
    this.configure(cleanUrl, apiToken, profile.account_id);
    return { profile };
  }

  async getConversations(
    filters: Partial<ConversationFilters> = {},
    page = 1
  ): Promise<ChatwootConversation[]> {
    const params = new URLSearchParams({ page: String(page), status: filters.status ?? 'open' });
    if (filters.assigneeType && filters.assigneeType !== 'all') {
      params.set('assignee_type', filters.assigneeType);
    }
    filters.labels?.forEach((l) => params.append('labels[]', l));
    const data = await this.request<{ data: { payload: ChatwootConversation[] } }>(
      `${API.CONVERSATIONS(this.accountId)}?${params.toString()}`
    );
    return data.data.payload;
  }

  async getConversation(id: number): Promise<ChatwootConversation> {
    return this.request<ChatwootConversation>(API.CONVERSATION(this.accountId, id));
  }

  async getMessages(conversationId: number, before?: number): Promise<ChatwootMessage[]> {
    const path =
      API.CONVERSATION_MESSAGES(this.accountId, conversationId) +
      (before ? `?before=${before}` : '');
    const data = await this.request<{ payload: ChatwootMessage[] }>(path);
    return data.payload;
  }

  async sendMessage(
    conversationId: number,
    payload: ChatwootSendMessagePayload
  ): Promise<ChatwootMessage> {
    return this.request<ChatwootMessage>(
      API.CONVERSATION_MESSAGES(this.accountId, conversationId),
      { method: 'POST', body: JSON.stringify(payload) }
    );
  }

  // Send a file attachment using multipart/form-data
  async sendAttachment(
    conversationId: number,
    fileUri: string,
    fileName: string,
    mimeType: string,
    isPrivate = false
  ): Promise<ChatwootMessage> {
    const url = `${this.baseUrl}${API.CONVERSATION_MESSAGES(this.accountId, conversationId)}`;
    const form = new FormData();
    form.append('message_type', 'outgoing');
    form.append('private', String(isPrivate));
    form.append('attachments[]', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);

    const res = await fetch(url, {
      method: 'POST',
      headers: { api_access_token: this.apiToken },
      body: form,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`Upload ${res.status}: ${text}`);
    }
    return res.json() as Promise<ChatwootMessage>;
  }

  async deleteMessage(conversationId: number, messageId: number): Promise<void> {
    await this.request<void>(
      `${API.CONVERSATION_MESSAGES(this.accountId, conversationId)}/${messageId}`,
      { method: 'DELETE' }
    );
  }

  async toggleStatus(conversationId: number, status: ConversationStatus): Promise<void> {
    await this.request<void>(API.CONVERSATION_TOGGLE_STATUS(this.accountId, conversationId), {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async setLabels(conversationId: number, labels: string[]): Promise<string[]> {
    const data = await this.request<{ payload: string[] }>(
      API.CONVERSATION_LABELS(this.accountId, conversationId),
      { method: 'POST', body: JSON.stringify({ labels }) }
    );
    return data.payload;
  }

  async searchContacts(query: string): Promise<ChatwootContact[]> {
    const params = new URLSearchParams({ q: query, include_contacts: 'true' });
    const data = await this.request<{ payload: ChatwootContact[] }>(
      `${API.CONTACTS_SEARCH(this.accountId)}?${params.toString()}`
    );
    return data.payload;
  }

  async getContact(id: number): Promise<ChatwootContact> {
    return this.request<ChatwootContact>(API.CONTACT(this.accountId, id));
  }

  async getContactConversations(contactId: number): Promise<ChatwootConversation[]> {
    const data = await this.request<{ payload: ChatwootConversation[] }>(
      API.CONTACT_CONVERSATIONS(this.accountId, contactId)
    );
    return data.payload;
  }

  async getLabels(): Promise<ChatwootLabel[]> {
    const data = await this.request<{ payload: ChatwootLabel[] }>(
      API.LABELS(this.accountId)
    );
    return data.payload;
  }

  async getCannedResponses(
    query = ''
  ): Promise<Array<{ id: number; short_code: string; content: string }>> {
    const params = new URLSearchParams({ search: query });
    const data = await this.request<{
      payload: Array<{ id: number; short_code: string; content: string }>;
    }>(`${API.CANNED_RESPONSES(this.accountId)}?${params.toString()}`);
    return data.payload;
  }
}

// Singleton adapter instance shared across the app
export const chatService = new ChatwootAdapter();
