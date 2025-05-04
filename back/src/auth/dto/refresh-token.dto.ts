import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RefresResponse {
  @IsNotEmpty()
  @IsString()
  message: string;
}
