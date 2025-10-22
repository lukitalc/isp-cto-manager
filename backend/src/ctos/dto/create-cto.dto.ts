import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { CtoStatus } from '../entities/cto.entity';

export class CreateCtoDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsString()
  splitterType: string;

  @IsNumber()
  @Min(1)
  totalPorts: number;

  @IsEnum(CtoStatus)
  @IsOptional()
  status?: CtoStatus;

  @IsDateString()
  @IsOptional()
  installationDate?: string;
}

