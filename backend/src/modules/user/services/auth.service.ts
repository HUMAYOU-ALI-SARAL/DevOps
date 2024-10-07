import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LoginDTO, LoginResponseDTO, RegisterDTO, RegisterResponseDTO, SaveAccountIdDTO, UpdateUserPasswordDTO, UserInfoDTO, ValidateOtpDTO, ValidateOtpResponseDTO } from '@/dtos/user.dto';
import { rollRandom } from '@/utils/random';
import { EmailService } from '@/common/services/email/email.service';
import * as bcrypt from 'bcryptjs';
import { DBService } from '@/common/modules/db/db.service';
import {Request} from 'express';
import { REQUEST } from '@nestjs/core';
import { User } from '@/entities/user.entity';
import { JwtService } from '@/common/services/jwt/jwt.service';
import { BlockchainDataService } from '@/common/modules/blockchain-data/blockchain-data.service';
import { AccountId } from '@hashgraph/sdk';
import { NodeCacheService } from '@/common/modules/node-cache/node-cache.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DBService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly nodeCacheService: NodeCacheService,
    private readonly blockchainDataService: BlockchainDataService,
    @Inject(REQUEST) private readonly request: Request & {user: User},
  ) {}

  async register({email, name, password}: RegisterDTO) {
    try {
      if (!email || !name || !password) {
        return new HttpException('Wrong request body', HttpStatus.BAD_REQUEST);
      }

      const emailExists = await this.dbService.getUserByEmail(email);

      if (emailExists) {
        return new HttpException('The Email is already registered', HttpStatus.CONFLICT);
      }

      const dummyOTP = rollRandom(100000, 900000).toString();

      const hashedPassword = await bcrypt.hash(password, 10);
      const [firstName, lastName] = name.split(' ');

      const user = await this.dbService.createUser({
        email,
        password: hashedPassword,
        otp: dummyOTP,
        first_name: firstName,
        last_name: lastName ?? null,
      })

      await this.emailService.sendOTPEmail(email, dummyOTP);
      
      const jwtToken = await this.jwtService.generateToken({ userId: user.id });

      return new RegisterResponseDTO(user.id, user.email, jwtToken);
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateOTP({ otp }: ValidateOtpDTO) {
    try {
      const user = this.request.user;

      const requestNumber = this.nodeCacheService.getOtpRequestCounter(user.id);

      if (requestNumber && requestNumber >= 3) {
        return new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
      }

      if (user.verified) {
        return new HttpException('User has already been verified', HttpStatus.BAD_REQUEST);
      }

      if (user.otp !== otp) {
        const updatedRequestNumber = requestNumber ? requestNumber + 1 : 1;
        this.nodeCacheService.setOtpRequestCounter(user.id, updatedRequestNumber);

        return new HttpException('Invalid OTP code', HttpStatus.BAD_REQUEST);
      }

      user.otp = null;
      user.verified = true;
      
      await this.dbService.updateUser(user);

      return new ValidateOtpResponseDTO(user.id, user.email);
    } catch (error) {
      console.error('Error during OTP validation:', error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login({email, password}: LoginDTO) {
    try {
      const user = await this.dbService.getUserByEmail(email);

      if (!user) {
        return new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
        
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) { 
        return new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
      }

      const jwtToken = await this.jwtService.generateToken({userId: user.id});

      if (!user.verified) {
        const dummyOTP = rollRandom(100000, 900000).toString();
        await this.emailService.sendOTPEmail(email, dummyOTP);
  
        user.otp = dummyOTP;
        user.verified = false;
  
        await this.dbService.updateUser(user);
  
        return new LoginResponseDTO(user.id, jwtToken, false);
      }
      
      await this.dbService.updateUser(user);

      return new LoginResponseDTO(user.id, jwtToken, true);
    } catch (error) {
      console.error('Error during OTP validation:', error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async resendOTP() {
    try {
      const user = this.request.user;

      const timedOut = this.nodeCacheService.checkTimeoutOtpResend(user.id);
  
      if (timedOut) {
        return new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      const dummyOTP = rollRandom(100000, 900000).toString();
      await this.emailService.sendOTPEmail(user.email, dummyOTP);
  
      user.otp = dummyOTP;
      user.verified = false;
      await this.dbService.updateUser(user);
  
      this.nodeCacheService.setTimeoutOtpResend(user.id);
  
      return {message: 'Success'};
    } catch (error) {
      console.error('Error during OTP validation:', error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async saveAccountIdAndEvmAddress({ accountId }: SaveAccountIdDTO) {
    try {
      const user = this.request.user;

      user.account_id = accountId;

      const {
        evmAddress,
        error
      } = await this.blockchainDataService.getAccountEVM({ accountId });

      if (error) {
        console.log(error);
      }

      if (evmAddress === null) {
        user.evm_address = `0x${AccountId.fromString(accountId)?.toSolidityAddress()?.toLocaleLowerCase()}`;
      } else {
        user.evm_address = evmAddress.toLowerCase();
      }
     
      await this.dbService.updateUser(user);
    } catch (error) {
      console.error('Error during OTP validation:', error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAccountId() {
    const user = this.request.user;

    return user.account_id;
  }

  async updatePassword({newPassword, oldPassword}: UpdateUserPasswordDTO) {
    const user = this.request.user;

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) { 
        return new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;

    const updatedUser = await this.dbService.updateUser(user);

    return new UserInfoDTO({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      bio: updatedUser.bio,
      username: updatedUser.username,
      accountId: updatedUser.account_id,
      links: updatedUser.links,
      bgImgUrl: updatedUser.bg_img_url,
      profileImgUrl: updatedUser.profile_img_url,
      createdAt: updatedUser.created_at,
      evmAddress: updatedUser.evm_address,
    })
  }
}
