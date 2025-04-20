import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Success message after logout',
    example: 'Logged out successfully',
  })
  message: string;
}
