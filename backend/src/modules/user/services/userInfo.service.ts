import { ConflictException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserInfoDTO, UpdateUserInfoFilesDTO, UserAccountIdDTO, UserInfoDTO } from '@/dtos/user.dto';
import { DBService } from '@/common/modules/db/db.service';
import {Request} from 'express';
import { REQUEST } from '@nestjs/core';
import { User } from '@/entities/user.entity';
import { FileStorageService } from '@/common/services/file-storage/file-storage.service';

@Injectable()
export class UserInfoService {
  constructor(
    private readonly dbService: DBService,
    private readonly fileStorageService: FileStorageService,
    @Inject(REQUEST) private readonly request: Request & {user: User},
  ) {}

  async getUserInfo(accountId?: string) {
    try {
      let user = this.request.user;

      if (accountId) {
        user = await this.dbService.getUserByAccountId(accountId);
      }

      if (!user) {
        return new NotFoundException(`User with accountId '${accountId}' not found!`);
      }

      return new UserInfoDTO({
        id: user.id,
        email: accountId ? null : user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        username: user.username,
        accountId: user.account_id,
        links: user.links,
        bgImgUrl: user.bg_img_url,
        profileImgUrl: user.profile_img_url,
        createdAt: user.created_at,
        evmAddress: user.evm_address,
      })
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserAccountId(username: string) {
    try {
      const user = await this.dbService.getUserByUsername(username);

      if (!user || !user.account_id) {
        return new NotFoundException(`Username '${username}' not found`);
      }

      return new UserAccountIdDTO(user?.account_id);
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  private async uploadUserImages(files: UpdateUserInfoFilesDTO) {
    try {
      const filesKeys = Object.keys(files);
      let savedFiles: {[key: string]: string} = {};
  
      if (files && filesKeys.length) {
        const savedFilesPaths = await Promise.all(filesKeys.map((fileKey) => {

          return this.fileStorageService.upload(files[fileKey][0], 'images');
        }))
  
        filesKeys.forEach((fileKey, index) => {
          savedFiles[`${fileKey}Url`] = savedFilesPaths[index];
        })
      }
  
      return savedFiles;
    } catch (err) {
      return err;
    }
  }
  
  async updateInfo(files: UpdateUserInfoFilesDTO, data: UpdateUserInfoDTO) {
    try {
      const user = this.request.user;

      const {
        firstName,
        lastName,
        username,
        bio,
        links,
      } = data;

      const savedImages = await this.uploadUserImages(files);

      if (savedImages instanceof HttpException) {
        throw savedImages;
      }

      user.first_name = firstName ?? user.first_name;
      user.last_name = lastName ?? user.last_name;
      user.username = username ?? user.username;
      user.bio = bio ?? user.bio;
      user.links = links ?? user.links;

      if (savedImages.profileImgUrl) {
        const oldImage = user.profile_img_url;

        user.profile_img_url = savedImages.profileImgUrl;
        if (oldImage) this.fileStorageService.delete(oldImage);
      }

      if (savedImages.bgImgUrl) {
        const oldImage = user.bg_img_url;

        user.bg_img_url = savedImages.bgImgUrl;
        if (oldImage) this.fileStorageService.delete(oldImage);
      }

      try {
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
      } catch (err) {
        if (err.code === '23505') {
          return new ConflictException(`A User with the username '${username}' exists already`);
        }

        throw err;
      }
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
