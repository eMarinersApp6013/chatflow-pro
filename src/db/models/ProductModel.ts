import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class ProductModel extends Model {
  static table = 'products';

  @field('remote_id') remoteId!: string;
  @field('name') name!: string;
  @field('description') description!: string | null;
  @field('price') price!: number;
  @field('category') category!: string;
  @field('emoji') emoji!: string | null;
  @field('image_url') imageUrl!: string | null;
  @field('stock') stock!: number;
  @field('rating') rating!: number;
  @field('reviews') reviews!: number;
  @field('variants') variantsJson!: string;
  @field('is_hot') isHot!: boolean;
  @field('sort_order') sortOrder!: number;

  get variants(): string[] {
    try {
      return JSON.parse(this.variantsJson || '[]');
    } catch {
      return [];
    }
  }

  get isOutOfStock(): boolean {
    return this.stock === 0;
  }

  get isLowStock(): boolean {
    return this.stock > 0 && this.stock < 5;
  }
}
