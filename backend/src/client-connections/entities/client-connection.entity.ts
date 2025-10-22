import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Cto } from '../../ctos/entities/cto.entity';

@Entity('client_connections')
@Unique(['ctoId', 'portNumber'])
export class ClientConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ctoId: string;

  @Column({ type: 'smallint' })
  portNumber: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  contractId: string;

  @Column({ type: 'varchar', length: 100 })
  onuSerialNumber: string;

  @Column({ type: 'date', nullable: true })
  connectionDate: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Cto, (cto) => cto.connections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ctoId' })
  cto: Cto;
}

