import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientConnection } from './entities/client-connection.entity';
import { CtosModule } from '../ctos/ctos.module';
import { ClientConnectionsController } from './client-connections.controller';
import { ClientConnectionsService } from './client-connections.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientConnection]),
    CtosModule,
  ],
  controllers: [ClientConnectionsController],
  providers: [ClientConnectionsService],
})
export class ClientConnectionsModule {}
