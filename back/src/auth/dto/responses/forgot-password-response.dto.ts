import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Password reset email sent successfully',
  })
  message: string;
}
