import { IsString, IsNumber, IsUUID, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateClientConnectionDto {
  @IsUUID()
  ctoId: string;

  @IsNumber()
  @Min(1)
  portNumber: number;

  @IsString()
  contractId: string;

  @IsString()
  onuSerialNumber: string;

  @IsDateString()
  @IsOptional()
  connectionDate?: string;
}

