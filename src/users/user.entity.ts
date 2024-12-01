import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Favorite } from '../favorite/favorite.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  public userId: string;

  @Column()
  public name: string;

  @Column()
  public password: string;

  @Column({ unique: true })
  public phoneNumber: string;

  @Column()
  public email: string;

  @Column()
  public imageUrl: string;

  @Column({ default: 0 })
  public point: number;

  @Column({ default: 36.5 })
  public temperature: number;

  @Column({ default: '' })
  public purchaseQrUrl: string;

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];
}
