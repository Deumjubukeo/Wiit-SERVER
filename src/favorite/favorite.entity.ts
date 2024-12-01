import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { LostStuff } from '../lostStuff/lostStuff.entity';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favorites)
  user: User;

  @ManyToOne(() => LostStuff, (lostStuff) => lostStuff.favorites)
  lostStuff: LostStuff;
}
