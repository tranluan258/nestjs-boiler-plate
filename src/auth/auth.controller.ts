import { JwtPayload } from './interface/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local.guard';
import { Account } from './decorator/account.decorator';
import { JwtAuthGuard } from './guard/jwt.guard';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Login success',
    schema: {
      properties: {
        accessToken: {
          type: 'string',
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto, @Account() account: JwtPayload) {
    return await this.authService.login(account);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Account() account: JwtPayload) {
    return account;
  }
}
