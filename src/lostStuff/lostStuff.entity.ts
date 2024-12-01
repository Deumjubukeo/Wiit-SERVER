import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn, OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Favorite } from '../favorite/favorite.entity';

@Entity()
export class LostStuff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @UpdateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'createUserUserId' })
  createUser: User;

  @Column()
  region: string;

  @Column()
  imageUrl: string;

  @OneToMany(() => Favorite, (favorite) => favorite.lostStuff)
  favorites: Favorite[];
}
