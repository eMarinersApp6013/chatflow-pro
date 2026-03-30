import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class ContactModel extends Model {
  static table = 'contacts';

  @field('remote_id') remoteId!: number;
  @field('name') name!: string;
  @field('email') email!: string | null;
  @field('phone_number') phoneNumber!: string | null;
  @field('avatar_url') avatarUrl!: string | null;
  @field('identifier') identifier!: string | null;
  @field('location') location!: string | null;
  @field('additional_attributes') additionalAttributesJson!: string | null;
  @field('synced_at') syncedAt!: number;

  get additionalAttributes(): Record<string, unknown> {
    try {
      return JSON.parse(this.additionalAttributesJson || '{}');
    } catch {
      return {};
    }
  }
}
