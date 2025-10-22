import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cto } from './entities/cto.entity';
import { CtosController } from './ctos.controller';
import { CtosService } from './ctos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cto])],
  controllers: [CtosController],
  providers: [CtosService],
  exports: [TypeOrmModule],
})
export class CtosModule {}
