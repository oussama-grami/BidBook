import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/Enums/roles.enum';

export class UserDto {
  @ApiProperty({ description: 'User ID', example: '1' })
  id: number;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'User role', example: 'admin' })
  role: Role;

  @ApiProperty({ description: 'User image' })
  imgUrl: string;

  @ApiProperty({ description: 'Whether MFA is enabled', example: true })
  isMFAEnabled: boolean;
}

export class MfaVerifyResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken?: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken?: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
