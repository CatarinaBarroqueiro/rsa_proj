import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RealTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-json', { nullable: true })
  obus: { obu: string, location: { latitude: number, longitude: number } }[];


  @Column('simple-json', { nullable: true })
  connectivity: { pair: { obu1: string, obu2: string } }[];
}
