import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class KnowledgeItemModel extends Model {
  static table = 'knowledge_items';

  @field('title') title!: string;
  @field('content') content!: string;
  @field('category') category!: string;
  @field('tags') tags!: string; // space-separated

  @field('created_at') createdAt!: number;

  get tagList(): string[] {
    return this.tags.split(' ').filter(Boolean);
  }
}
