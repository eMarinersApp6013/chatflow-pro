import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class AddressModel extends Model {
  static table = 'addresses';

  @field('label') label!: string;
  @field('name') name!: string;
  @field('phone') phone!: string;
  @field('line1') line1!: string;
  @field('line2') line2!: string | null;
  @field('city') city!: string;
  @field('state') state!: string;
  @field('pincode') pincode!: string;
  @field('country') country!: string;
  @field('is_default') isDefault!: boolean;
  @field('created_at') createdAt!: number;
}
