import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseOptionalIntPipe implements PipeTransform<string | undefined, number | undefined> {
  transform(value: string | undefined, metadata: ArgumentMetadata): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    const parsedNumber = parseInt(value, 10);

    if (isNaN(parsedNumber)) {
      throw new BadRequestException('Validation failed (numeric string is expected)');
    }

    return parsedNumber;
  }
}