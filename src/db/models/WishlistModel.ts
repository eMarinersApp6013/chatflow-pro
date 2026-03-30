import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class WishlistModel extends Model {
  static table = 'wishlist_items';

  @field('product_remote_id') productRemoteId!: string;
  @field('added_at') addedAt!: number;
}
