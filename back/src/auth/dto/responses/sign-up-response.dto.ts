import { ApiProperty } from '@nestjs/swagger';

export class SignUpResponseDto {
  @ApiProperty({
    description: 'Success message after signup',
    example: 'User registered successfully. Please verify your email.',
  })
  message: string;
}
