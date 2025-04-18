import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DisableMfaDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
