import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Goods {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ default: 0 })
  prize: number;

  @Column()
  imageUrl: string;

  @Column({ default: 0 })
  purchaseCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
