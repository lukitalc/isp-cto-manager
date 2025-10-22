import { PartialType } from '@nestjs/mapped-types';
import { CreateCtoDto } from './create-cto.dto';

export class UpdateCtoDto extends PartialType(CreateCtoDto) {}

