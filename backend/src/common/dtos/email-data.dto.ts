import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class EmailDataDto {
  /**
   * The Message-ID value string.
   */
  @ApiProperty({ type: String })
  messageId: string;
  /**
   * The HTML body of the message.
   */
  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'boolean', example: false }] })
  @IsOptional()
  html?: string | false;
  /**
   * The plaintext body of the message.
   */
  @ApiProperty({ type: String })
  @IsOptional()
  text?: string;
  /**
   * The subject line.
   */
  @ApiProperty({ type: String })
  @IsOptional()
  subject?: string;
  /**
   * A Date object for the `Date:` header.
   */
  @ApiProperty({ type: Date })
  @IsOptional()
  date?: Date;
  /**
   * An address for the `From:` header.
   */
  @ApiProperty({ type: String })
  @IsOptional()
  from?: string;
}
