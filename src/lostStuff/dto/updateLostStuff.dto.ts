import { PartialType } from '@nestjs/mapped-types';
import { CreateLostStuffDto } from './createLostStuff.dto';

export class UpdateLostStuffDto extends PartialType(CreateLostStuffDto) {}
