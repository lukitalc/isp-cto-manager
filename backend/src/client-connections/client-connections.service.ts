import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientConnection } from './entities/client-connection.entity';
import { CreateClientConnectionDto } from './dto/create-client-connection.dto';
import { UpdateClientConnectionDto } from './dto/update-client-connection.dto';
import { Cto } from '../ctos/entities/cto.entity';

@Injectable()
export class ClientConnectionsService {
  constructor(
    @InjectRepository(ClientConnection)
    private readonly connectionRepository: Repository<ClientConnection>,
    @InjectRepository(Cto)
    private readonly ctoRepository: Repository<Cto>,
  ) {}

  async create(createConnectionDto: CreateClientConnectionDto): Promise<ClientConnection> {
    // Verificar se a CTO existe
    const cto = await this.ctoRepository.findOne({
      where: { id: createConnectionDto.ctoId },
    });

    if (!cto) {
      throw new NotFoundException(`CTO com ID ${createConnectionDto.ctoId} não encontrada`);
    }

    // Verificar se a porta está dentro do range válido
    if (createConnectionDto.portNumber > cto.totalPorts) {
      throw new BadRequestException(
        `Porta ${createConnectionDto.portNumber} é inválida. Esta CTO possui apenas ${cto.totalPorts} portas.`
      );
    }

    // Verificar se a porta já está ocupada
    const existingConnection = await this.connectionRepository.findOne({
      where: {
        ctoId: createConnectionDto.ctoId,
        portNumber: createConnectionDto.portNumber,
      },
    });

    if (existingConnection) {
      throw new ConflictException(
        `A porta ${createConnectionDto.portNumber} da CTO ${cto.name} já está ocupada pelo contrato ${existingConnection.contractId}`
      );
    }

    const connection = this.connectionRepository.create(createConnectionDto);
    return await this.connectionRepository.save(connection);
  }

  async findAll(): Promise<ClientConnection[]> {
    return await this.connectionRepository.find({
      relations: ['cto'],
    });
  }

  async findOne(id: string): Promise<ClientConnection> {
    const connection = await this.connectionRepository.findOne({
      where: { id },
      relations: ['cto'],
    });

    if (!connection) {
      throw new NotFoundException(`Conexão com ID ${id} não encontrada`);
    }

    return connection;
  }

  async findByContractId(contractId: string): Promise<ClientConnection> {
    const connection = await this.connectionRepository.findOne({
      where: { contractId },
      relations: ['cto'],
    });

    if (!connection) {
      throw new NotFoundException(`Conexão com contrato ${contractId} não encontrada`);
    }

    return connection;
  }

  async findByOnuSerial(onuSerialNumber: string): Promise<ClientConnection[]> {
    return await this.connectionRepository.find({
      where: { onuSerialNumber },
      relations: ['cto'],
    });
  }

  async update(id: string, updateConnectionDto: UpdateClientConnectionDto): Promise<ClientConnection> {
    const connection = await this.findOne(id);
    
    // Se estiver mudando de porta ou CTO, validar
    if (updateConnectionDto.ctoId || updateConnectionDto.portNumber) {
      const newCtoId = updateConnectionDto.ctoId || connection.ctoId;
      const newPortNumber = updateConnectionDto.portNumber || connection.portNumber;

      // Verificar se a nova porta está ocupada (exceto pela conexão atual)
      const existingConnection = await this.connectionRepository.findOne({
        where: {
          ctoId: newCtoId,
          portNumber: newPortNumber,
        },
      });

      if (existingConnection && existingConnection.id !== id) {
        throw new ConflictException(
          `A porta ${newPortNumber} já está ocupada`
        );
      }
    }

    Object.assign(connection, updateConnectionDto);
    
    return await this.connectionRepository.save(connection);
  }

  async remove(id: string): Promise<void> {
    const connection = await this.findOne(id);
    await this.connectionRepository.remove(connection);
  }

  async getPortsStatus(ctoId: string): Promise<any> {
    const cto = await this.ctoRepository.findOne({
      where: { id: ctoId },
      relations: ['connections'],
    });

    if (!cto) {
      throw new NotFoundException(`CTO com ID ${ctoId} não encontrada`);
    }

    const ports: any[] = [];
    for (let i = 1; i <= cto.totalPorts; i++) {
      const connection = cto.connections?.find(c => c.portNumber === i);
      
      ports.push({
        portNumber: i,
        status: connection ? 'occupied' : 'available',
        connection: connection ? {
          id: connection.id,
          contractId: connection.contractId,
          onuSerialNumber: connection.onuSerialNumber,
          connectionDate: connection.connectionDate,
        } : null,
      });
    }

    return {
      ctoId: cto.id,
      ctoName: cto.name,
      totalPorts: cto.totalPorts,
      occupiedPorts: cto.connections?.length || 0,
      availablePorts: cto.totalPorts - (cto.connections?.length || 0),
      ports,
    };
  }
}

