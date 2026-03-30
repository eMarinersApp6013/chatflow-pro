import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class LabelModel extends Model {
  static table = 'labels';

  @field('remote_id') remoteId!: number;
  @field('title') title!: string;
  @field('description') description!: string | null;
  @field('color') color!: string;
  @field('show_on_sidebar') showOnSidebar!: boolean;
}
