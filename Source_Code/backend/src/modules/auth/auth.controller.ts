import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { LoginDto, SignupDto, AuthResponseDto } from './dto/auth.dto';
import { EPermission, ERole } from 'src/common/enum/enum';
import { GoogleOAuthGuard } from '../../common/guards/google-oauth.guard';
import { RequestPermission } from 'src/common/helper/common.helper';
import { ApiGuard } from 'src/common/helper/swagger-api.helper';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @ApiBody({
    description: 'User login',
    type: LoginDto,
  })
  @ApiOkResponse({
    type: AuthResponseDto,
    description: 'JWT token and payload',
  })
  async signIn(@Body() body: LoginDto) {
    return await this.authService.signInJwt(body.email, body.password);
  }

  @Post('signup')
  @ApiBody({
    description: 'User registration',
    type: SignupDto,
  })
  async signUp(@Body() body: SignupDto) {
    return await this.authService.signUp(body);
  }

  @Get('test')
  @ApiResponse({ status: 200, description: 'Service is working' })
  test() {
    return 'Auth service is working!';
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiResponse({
    status: 302,
    description:
      'Redirects to Google OAuth login page. In browser, this will redirect to Google. In Swagger, copy the URL and open in a new tab.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Note: This endpoint redirects to Google. To test, copy the full URL from Swagger and open in browser.',
  })
  async googleAuth(@Req() req) {
    // This will redirect to Google OAuth page
    // Swagger users: Copy the URL and open in browser
  }

  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Google OAuth callback - returns JWT token',
    schema: {
      example: {
        payload: {
          id: 1,
          email: 'user@gmail.com',
          name: 'John Doe',
          status: 'active',
          roleId: 1,
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  async googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  @Get('profile')
  @RequestPermission(EPermission.TEST, 'TEST')
  async getProfile(@Req() req) {
    if (!req.user) {
      return { message: 'No user found' };
    }
    return req.user;
  }

  @Get('adminProtected')
  @ApiGuard()
  @RequestPermission(EPermission.TEST_ADMIN, 'TEST')
  async adminProtected(@Req() req) {
    if (!req.user) {
      return { message: 'Access denied, no user found' };
    }
    return { message: 'Welcome to the admin area', user: req.user };
  }
}
