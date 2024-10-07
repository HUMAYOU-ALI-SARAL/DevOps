import { Controller, Body, HttpException, UseGuards, Get, Put, UseInterceptors, UploadedFiles, Param, ParseIntPipe } from '@nestjs/common';
import { UserVerifiedGuard } from '@/common/guards/user-verified.guard';
import { UserInfoService } from '@/modules/user/services/userInfo.service';
import { UpdateUserInfoDTO, UpdateUserInfoFilesDTO } from '@/dtos/user.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';

@Controller('user/info')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  @Get()
  @UseGuards(UserVerifiedGuard)
  async getInfo() {
    const result = await this.userInfoService.getUserInfo();

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Get(':accountId')
  async getUserInfo(@Param('accountId') accountId: string) {
    const result = await this.userInfoService.getUserInfo(accountId);

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Put()
  @UseGuards(UserVerifiedGuard)
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'bgImg', maxCount: 1 },
    { name: 'profileImg', maxCount: 1 },
  ]))
  async updateInfo(
    @UploadedFiles() updateUserInfoFilesDTO: UpdateUserInfoFilesDTO,
    @Body() updateUserInfoDTO: UpdateUserInfoDTO,
  ) {
    const result = await this.userInfoService.updateInfo(updateUserInfoFilesDTO, updateUserInfoDTO);

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }


  @Get('accountId/:username')
  async getUserAccountId(@Param('username') username: string) {
    const result = await this.userInfoService.getUserAccountId(username);

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }
}
