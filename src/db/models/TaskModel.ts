import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class TaskModel extends Model {
  static table = 'tasks';

  @field('title') title!: string;
  @field('is_completed') isCompleted!: boolean;
  @field('due_date') dueDate!: number | null;
  @field('priority') priority!: string; // 'low' | 'medium' | 'high'
  @field('created_at') createdAt!: number;

  get isOverdue(): boolean {
    if (!this.dueDate || this.isCompleted) return false;
    return Date.now() / 1000 > this.dueDate;
  }
}
