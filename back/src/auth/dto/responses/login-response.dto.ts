import { ApiProperty } from '@nestjs/swagger';

class UserDto {
  @ApiProperty({ description: 'User ID', example: '1' })
  id: number;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  lastName: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken?: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}

export class MfaRequiredResponseDto {
  @ApiProperty({
    description: 'Message indicating MFA verification is required',
    example: 'MFA verification required',
  })
  message: string;

  @ApiProperty({
    description: 'Temporary token for MFA verification',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  mfaToken: string;

  @ApiProperty({
    description: 'Flag indicating MFA is required',
    example: true,
  })
  isMfaRequired: boolean;
}
