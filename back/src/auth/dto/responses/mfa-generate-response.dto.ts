import { ApiProperty } from '@nestjs/swagger';

export class MfaGenerateResponseDto {
  @ApiProperty({
    description: 'MFA secret key',
    example: 'JBSWY3DPEHPK3PXP',
  })
  secret: string;

  @ApiProperty({
    description: 'QR code data URL for scanning',
    example: 'data:image/png;base64,iVBORw0KGgoA...',
  })
  qrCode: string;

  @ApiProperty({
    description: 'OTP Auth URL for manual setup',
    example:
      'otpauth://totp/BookApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=BookApp',
  })
  otpAuthUrl: string;
}
