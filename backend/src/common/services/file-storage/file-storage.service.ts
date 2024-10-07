import { Injectable, PayloadTooLargeException } from '@nestjs/common';
import * as path from 'path';
import { writeFile, unlink } from 'fs/promises';
import * as fs from 'fs';
import { rollRandom } from '@/utils/random';

@Injectable()
export class FileStorageService {
  private readonly uploadDirecory: string;
  private readonly maxFileSize: number = 30000000; // Size in bytes

  constructor() {
    this.uploadDirecory = path.resolve(__dirname, '../../../../static');
  }

  async upload(file: Express.Multer.File, resultFolder: string = '') {
    if (file.size > this.maxFileSize) {
      throw new PayloadTooLargeException(`Maximum file size is ${this.maxFileSize / 1000000} MB`);
    }

    const extension = path.extname(file.originalname);
    const newFileName = `${Date.now()}-${rollRandom(0, 99999)}${extension}`;
    const folderPath = path.resolve(this.uploadDirecory, resultFolder)
    const filePath = path.join(folderPath, newFileName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    await writeFile(filePath, file.buffer);

    return `/${path.join(resultFolder, newFileName)}`;
  }

  async delete(relativePath: string) {
    const filePath = path.join(this.uploadDirecory, relativePath);

    if (!fs.existsSync(filePath)) return;
    
    await unlink(filePath);
  }
}
