import { PartialType } from '@nestjs/mapped-types';
import { CreateClientConnectionDto } from './create-client-connection.dto';

export class UpdateClientConnectionDto extends PartialType(CreateClientConnectionDto) {}

