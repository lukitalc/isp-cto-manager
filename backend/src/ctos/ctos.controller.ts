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
import { CtosService } from './ctos.service';
import { CreateCtoDto } from './dto/create-cto.dto';
import { UpdateCtoDto } from './dto/update-cto.dto';
import { CtoStatus } from './entities/cto.entity';

@Controller('ctos')
export class CtosController {
  constructor(private readonly ctosService: CtosService) {}

  @Post()
  create(@Body(ValidationPipe) createCtoDto: CreateCtoDto) {
    return this.ctosService.create(createCtoDto);
  }

  @Get()
  findAll(@Query('status') status?: CtoStatus) {
    return this.ctosService.findAll(status);
  }

  @Get('occupancy-stats')
  getOccupancyStats() {
    return this.ctosService.getOccupancyStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ctosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCtoDto: UpdateCtoDto,
  ) {
    return this.ctosService.update(id, updateCtoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ctosService.remove(id);
  }
}

