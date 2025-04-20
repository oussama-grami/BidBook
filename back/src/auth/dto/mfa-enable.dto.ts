import { IsNotEmpty, IsString, Length } from 'class-validator';

export class MfaEnableDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}
