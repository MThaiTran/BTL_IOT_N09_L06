import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@user.com' })
  email: string;

  @ApiProperty({ example: 'password' })
  password: string;
}

export class SignupDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  name?: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  password: string;

  @ApiPropertyOptional({ example: 'strongPassword123' })
  passwordConfirm?: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Payload returned after authentication' })
  payload: Record<string, any> | null;

  @ApiProperty({ description: 'JWT token' })
  token: string;
}
