import { ApiProperty } from '@nestjs/swagger';

export class MfaDisableResponseDto {
  @ApiProperty({
    description: 'Success message after disabling MFA',
    example: 'MFA disabled successfully',
  })
  message: string;
}
