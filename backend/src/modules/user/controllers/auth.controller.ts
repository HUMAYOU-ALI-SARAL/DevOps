import { Controller, Post, Body, HttpException, Req, UseGuards, Res, Get, HttpCode, Put } from '@nestjs/common';
import { LoginDTO, RegisterDTO, SaveAccountIdDTO, UpdateUserPasswordDTO, ValidateOtpDTO } from '@/dtos/user.dto';
import { AuthService } from '@/modules/user/services/auth.service';
import { Response } from 'express';
import { UserAuthGuard } from '@/common/guards/user-auth.guard';
import { UserVerifiedGuard } from '@/common/guards/user-verified.guard';

@Controller('user')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  /////////////////////////////////////////////////
  ///////////////// AUTH
  /////////////////////////////////////////////////

  @Post('register')
  async regiseter(@Body() registerDto: RegisterDTO) {
    const result = await this.authService.register(registerDto);

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Post('otp')
  @UseGuards(UserAuthGuard)
  async validateOtp(@Body() validateOtpDto: ValidateOtpDTO) {
    const result = await this.authService.validateOTP(validateOtpDto);

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Post('login')
  async login(@Body() loginDTO: LoginDTO) {
    const result = await this.authService.login(loginDTO);

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Get('otp/resend')
  @HttpCode(200)
  @UseGuards(UserAuthGuard)
  async resendOTP() {
    const result = await this.authService.resendOTP();

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }


  /////////////////////////////////////////////////
  ///////////////// ACCOUNT-ID
  /////////////////////////////////////////////////

  @Post('account-id')
  @HttpCode(200)
  @UseGuards(UserVerifiedGuard)
  async saveAccountIdAndEvmAddress(
    @Body() SaveAccountIdDTO: SaveAccountIdDTO,
  ) {
    await this.authService.saveAccountIdAndEvmAddress(SaveAccountIdDTO);

    return {message: 'Success'};
  }

  @Get('account-id')
  @UseGuards(UserVerifiedGuard)
  async getAccountId() {
    const accountId = await this.authService.getAccountId();

    return accountId;
  }


  /////////////////////////////////////////////////
  ///////////////// PASSWORD
  /////////////////////////////////////////////////

  @Put('password')
  @UseGuards(UserVerifiedGuard)
  async updatePassword(
    @Body() updateUserPasswordDTO: UpdateUserPasswordDTO,
  ) {
    const result = await this.authService.updatePassword(updateUserPasswordDTO);

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }
}
