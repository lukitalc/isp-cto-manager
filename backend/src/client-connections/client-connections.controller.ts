import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ClientConnectionsService } from './client-connections.service';
import { CreateClientConnectionDto } from './dto/create-client-connection.dto';
import { UpdateClientConnectionDto } from './dto/update-client-connection.dto';

@Controller('client-connections')
export class ClientConnectionsController {
  constructor(private readonly clientConnectionsService: ClientConnectionsService) {}

  @Post()
  create(@Body(ValidationPipe) createConnectionDto: CreateClientConnectionDto) {
    return this.clientConnectionsService.create(createConnectionDto);
  }

  @Get()
  findAll() {
    return this.clientConnectionsService.findAll();
  }

  @Get('search/contract/:contractId')
  findByContractId(@Param('contractId') contractId: string) {
    return this.clientConnectionsService.findByContractId(contractId);
  }

  @Get('search/onu/:onuSerial')
  findByOnuSerial(@Param('onuSerial') onuSerial: string) {
    return this.clientConnectionsService.findByOnuSerial(onuSerial);
  }

  @Get('ports-status/:ctoId')
  getPortsStatus(@Param('ctoId') ctoId: string) {
    return this.clientConnectionsService.getPortsStatus(ctoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientConnectionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateConnectionDto: UpdateClientConnectionDto,
  ) {
    return this.clientConnectionsService.update(id, updateConnectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientConnectionsService.remove(id);
  }
}

