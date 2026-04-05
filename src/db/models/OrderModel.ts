import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class OrderModel extends Model {
  static table = 'orders';

  @field('order_ref') orderRef!: string;
  @field('contact_name') contactName!: string;
  @field('conversation_remote_id') conversationRemoteId!: number;
  @field('items_json') itemsJson!: string;
  @field('total') total!: number;
  @field('address_label') addressLabel!: string | null;
  @field('status') status!: string; // placed | shipped | delivered | cancelled
  @field('created_at') createdAt!: number;

  get items(): Array<{ name: string; quantity: number; price: number; variant?: string }> {
    try {
      return JSON.parse(this.itemsJson || '[]');
    } catch {
      return [];
    }
  }
}
