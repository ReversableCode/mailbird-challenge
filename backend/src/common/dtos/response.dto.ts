import { ApiProperty } from '@nestjs/swagger';

export class IResponse<T, E = any> {
  data: T;
  @ApiProperty()
  isSuccess: boolean;
  error: E;
}
