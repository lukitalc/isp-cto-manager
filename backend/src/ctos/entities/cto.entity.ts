import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ClientConnection } from '../../client-connections/entities/client-connection.entity';

export enum CtoStatus {
  ATIVA = 'ATIVA',
  PLANEJADA = 'PLANEJADA',
  MANUTENCAO = 'MANUTENCAO',
}

@Entity('ctos')
export class Cto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'varchar', length: 10 })
  splitterType: string;

  @Column({ type: 'smallint' })
  totalPorts: number;

  @Column({
    type: 'enum',
    enum: CtoStatus,
    default: CtoStatus.ATIVA,
  })
  status: CtoStatus;

  @Column({ type: 'date', nullable: true })
  installationDate: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ClientConnection, (connection) => connection.cto)
  connections: ClientConnection[];
}

