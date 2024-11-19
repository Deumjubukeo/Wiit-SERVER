import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { LostStuff } from '../lostStuff/lostStuff.entity';
import { Message } from './message.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LostStuff, { eager: true })
  @JoinColumn({ name: 'lostStuffId' })
  lostStuff: LostStuff;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'writerUserId' })
  writer: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'requesterUserId' })
  requester: User;

  @Column({ default: false })
  isEnded: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @Column('simple-array', { nullable: true })
  currentUsers: string[];
}
