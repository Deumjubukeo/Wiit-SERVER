import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  public userId: string;

  @Column()
  public name: string;

  @Column()
  public password: string;

  @Column({ unique: true })
  public phoneNumber: string;
}
