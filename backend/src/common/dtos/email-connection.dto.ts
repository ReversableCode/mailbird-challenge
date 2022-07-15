import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class EmailConnectionDto {
  /**
   * The type of email server (IMAP, POP3).
   */
  @ApiProperty({ enum: ['IMAP', 'POP3'] })
  @IsEnum(['IMAP', 'POP3'])
  @IsNotEmpty()
  type: 'IMAP' | 'POP3';
  /**
   * Email username (usually the enail address).
   */
  @ApiProperty({ type: String })
  @IsNotEmpty()
  user: string;
  /**
   * Email password.
   */
  @ApiProperty({ type: String })
  @IsNotEmpty()
  password: string;
  /**
   * The hostname of the email server.
   */
  @ApiProperty({ type: String })
  @IsNotEmpty()
  host: string;
  /**
   * The port of the email server.
   */
  @ApiProperty({ type: Number })
  @IsNumber()
  port: number;
  /**
   * The secure connection flag (SSL/TLS, STARTTLS).
   */
  @ApiProperty({ enum: ['Unencrypted', 'SSL/TLS', 'STARTTLS'] })
  @IsEnum(['Unencrypted', 'SSL/TLS', 'STARTTLS'])
  @IsOptional()
  encryption?: 'Unencrypted' | 'SSL/TLS' | 'STARTTLS';
}
