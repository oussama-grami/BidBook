import { ApiProperty } from '@nestjs/swagger';

export class MfaEnableResponseDto {
  @ApiProperty({
    description: 'Success message after enabling MFA',
    example: 'MFA enabled successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Recovery codes for account access if MFA device is lost',
    example: ['6b3e5f9a', '12da45c8', '9f7e6d5c'],
    type: [String],
  })
  recoveryCodes: string[];
}
