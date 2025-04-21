import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Password reset successfully',
  })
  message: string;
}
