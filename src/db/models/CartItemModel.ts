import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class CartItemModel extends Model {
  static table = 'cart_items';

  @field('product_remote_id') productRemoteId!: string;
  @field('quantity') quantity!: number;
  @field('selected_variant') selectedVariant!: string | null;
  @field('contact_id') contactId!: string | null; // null = global cart
  @field('added_at') addedAt!: number;
}
