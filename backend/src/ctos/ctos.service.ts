import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cto, CtoStatus } from './entities/cto.entity';
import { CreateCtoDto } from './dto/create-cto.dto';
import { UpdateCtoDto } from './dto/update-cto.dto';

@Injectable()
export class CtosService {
  constructor(
    @InjectRepository(Cto)
    private readonly ctoRepository: Repository<Cto>,
  ) {}

  async create(createCtoDto: CreateCtoDto): Promise<Cto> {
    const cto = this.ctoRepository.create(createCtoDto);
    return await this.ctoRepository.save(cto);
  }

  async findAll(status?: CtoStatus): Promise<Cto[]> {
    const query = this.ctoRepository.createQueryBuilder('cto')
      .leftJoinAndSelect('cto.connections', 'connections');

    if (status) {
      query.where('cto.status = :status', { status });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Cto> {
    const cto = await this.ctoRepository.findOne({
      where: { id },
      relations: ['connections'],
    });

    if (!cto) {
      throw new NotFoundException(`CTO com ID ${id} não encontrada`);
    }

    return cto;
  }

  async update(id: string, updateCtoDto: UpdateCtoDto): Promise<Cto> {
    const cto = await this.findOne(id);
    
    Object.assign(cto, updateCtoDto);
    
    return await this.ctoRepository.save(cto);
  }

  async remove(id: string): Promise<void> {
    const cto = await this.findOne(id);
    await this.ctoRepository.remove(cto);
  }

  async getOccupancyStats(): Promise<any> {
    const ctos = await this.findAll();
    
    return ctos.map(cto => {
      const occupiedPorts = cto.connections?.length || 0;
      const occupancyRate = (occupiedPorts / cto.totalPorts) * 100;
      
      let occupancyLevel: 'low' | 'medium' | 'high';
      if (occupancyRate < 50) {
        occupancyLevel = 'low';
      } else if (occupancyRate < 85) {
        occupancyLevel = 'medium';
      } else {
        occupancyLevel = 'high';
      }

      return {
        id: cto.id,
        name: cto.name,
        latitude: cto.latitude,
        longitude: cto.longitude,
        status: cto.status,
        totalPorts: cto.totalPorts,
        occupiedPorts,
        availablePorts: cto.totalPorts - occupiedPorts,
        occupancyRate: Math.round(occupancyRate),
        occupancyLevel,
      };
    });
  }
}

