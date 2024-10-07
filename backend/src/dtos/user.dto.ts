import { UserLink } from "@/entities/user-link.entity";

export class RegisterDTO {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export class RegisterResponseDTO {
  constructor(
    readonly id: number,
    readonly email: string,
    readonly jwtToken: string,
  ) {}
}

export class ValidateOtpDTO {
  readonly otp: string;
}

export class ValidateOtpResponseDTO {
  constructor(
    readonly id: number,
    readonly email: string,
  ) {}
}

export class LoginDTO {
  readonly email: string;
  readonly password: string;
}

export class LoginResponseDTO {
  constructor(
    readonly id: number,
    readonly jwtToken: string,
    readonly verified: boolean,
  ) {}
}

//////////////////////////////////////////

export class SaveAccountIdDTO {
  readonly accountId: string;
}

//////////////////////////////////////////

export class UserInfoDTO {
  readonly id: number;
  readonly email?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly bio: string;
  readonly username: string;
  readonly accountId: string;
  readonly links: UserLink[];
  readonly bgImgUrl: string;
  readonly profileImgUrl: string;
  readonly createdAt: Date;
  readonly evmAddress: string;

  constructor(info: UserInfoDTO) {
    const {
      id,
      email = null,
      firstName,
      lastName,
      bio,
      username,
      accountId,
      links,
      bgImgUrl,
      profileImgUrl,
      createdAt,
      evmAddress,
    } = info;

    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.bio = bio;
    this.username = username;
    this.accountId = accountId;
    this.links = links;
    this.bgImgUrl = bgImgUrl;
    this.profileImgUrl = profileImgUrl;
    this.createdAt = createdAt;
    this.evmAddress = evmAddress;
  }
}

export class UpdateUserInfoFilesDTO {
  readonly bgImg?: Express.Multer.File[];
  readonly profileImg?: Express.Multer.File[];
}

export class UpdateUserInfoDTO {
  readonly firstName: string;
  readonly lastName: string;
  readonly username: string;
  readonly bio: string;
  readonly links: UserLink[];
}

export class UpdateUserPasswordDTO {
  readonly oldPassword: string;
  readonly newPassword: string;
}

export class UserAccountIdDTO {
  constructor(readonly accountId: string) {}
}