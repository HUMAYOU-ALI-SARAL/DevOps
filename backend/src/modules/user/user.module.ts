import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthController } from '@/modules/user/controllers/auth.controller';
import { AuthService } from '@/modules/user/services/auth.service';
import { EmailService } from '@/common/services/email/email.service';
import { JwtService } from '@/common/services/jwt/jwt.service';
import { UserInfoController } from '@/modules/user/controllers/userInfo.controller';
import { UserInfoService } from '@/modules/user/services/userInfo.service';
import { FileStorageService } from '@/common/services/file-storage/file-storage.service';
import { DBModule } from '@/common/modules/db/db.module';
import { BlockchainDataModule } from '@/common/modules/blockchain-data/blockchain-data.module';
import { NodeCacheModule } from '@/common/modules/node-cache/node-cache.module';

@Module({
  imports: [
    DBModule,
    NodeCacheModule,
    BlockchainDataModule,
  ],
  providers: [
    AuthService,
    UserInfoService,
    EmailService,
    JwtService,
    FileStorageService
  ],
  controllers: [
    AuthController,
    UserInfoController
  ]
})
export class UserModule {}
