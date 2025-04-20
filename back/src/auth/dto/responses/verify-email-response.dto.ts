import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailResponseDto {
  @ApiProperty({
    description: 'Success message after email verification',
    example: 'Email verified successfully',
  })
  message: string;
}
