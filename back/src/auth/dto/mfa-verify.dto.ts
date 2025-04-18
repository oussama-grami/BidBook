import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class MfaVerifyDto {
  @IsNotEmpty()
  @IsString()
  // Allow either a 6-digit code or recovery code format (8 characters)
  @Matches(/^(\d{6}|[a-zA-Z0-9]{8})$/, {
    message:
      'Code must be either a 6-digit OTP or an 8-character recovery code',
  })
  code: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean = false;
}
