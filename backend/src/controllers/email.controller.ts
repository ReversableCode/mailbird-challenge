import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  Session,
} from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailDataDto } from '@/common/dtos/email-data.dto';
import { EmailClient } from '@/common/decorators/email-client.decorator';
import { EmailConnectionDto } from '@/common/dtos/email-connection.dto';
import { EmailClientService } from '@/common/services/email-client.service';
import { IMAPClientService } from '@/common/services/imap-client.service';
import { POP3ClientService } from '@/common/services/pop3-client.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  @Post('authenticate')
  @ApiOperation({ summary: 'Authenticate the user with the email server and fetch the email folders' })
  @ApiResponse({ status: 201, description: 'The email folders have been fetched', type: [String] })
  async authenticate(@Session() session: Record<string, any>, @Body() emailConfig: EmailConnectionDto) {
    let client: EmailClientService;

    // Initialize the proper email client based on the email config type
    switch (emailConfig.type) {
      case 'IMAP':
        client = new IMAPClientService();
        break;
      case 'POP3':
        client = new POP3ClientService();
        break;
      default:
        throw new BadRequestException('Invalid server type');
    }

    // Connect to the email server
    await client.connect(emailConfig);

    // Save the email config to the session
    session.emailConfig = emailConfig;

    // Fetch the email folders from the server
    const folders = await client.fetchEmailFolders();

    // Return the email folders
    return folders;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout the user from the email server' })
  @ApiResponse({ status: 201, description: 'The user has been logged out' })
  async logout(@Session() session: Record<string, any>) {
    // Clear the email config from the session
    delete session.emailConfig;
  }

  @Get(':mailbox/fetch-headers')
  @ApiExtraModels(EmailDataDto)
  @ApiOperation({ summary: 'Fetch the email headers from the server' })
  @ApiParam({ name: 'mailbox', type: String, description: 'The mailbox to fetch the emails from', required: true })
  @ApiQuery({ name: 'limit', type: Number, description: 'The number of emails to fetch', required: false })
  @ApiQuery({ name: 'skip', type: Number, description: 'The number of emails to skip', required: false })
  @ApiResponse({ status: 200, description: 'The email headers have been fetched', type: [EmailDataDto] })
  async fetchHeadersFromServer(
    @EmailClient() client: EmailClientService,
    @Param('mailbox') mailbox: string,
    @Query('limit') limit = 25,
    @Query('skip') skip = 0,
  ) {
    // Fetch the email headers from the server
    const emails = await client.fetchEmailHeaders(limit, skip, mailbox);

    // Return the email headers
    return emails;
  }

  @Get(':mailbox/:id/fetch-body')
  @ApiExtraModels(EmailDataDto)
  @ApiOperation({ summary: 'Fetch the email body from the server' })
  @ApiParam({ name: 'mailbox', type: String, description: 'The mailbox to fetch the emails from', required: true })
  @ApiParam({ name: 'id', type: String, description: 'The id of the email to fetch', required: true })
  @ApiResponse({ status: 200, description: 'The email body has been fetched', type: EmailDataDto })
  async fetchEmailBodyById(
    @EmailClient() client: EmailClientService,
    @Param('mailbox') mailbox: string,
    @Param('id') id: string,
  ) {
    try {
      // Fetch the email body from the server
      const email = await client.fetchEmailById(id, mailbox);

      // Throw an error if the email is not found
      if (!email) throw new NotFoundException();

      // Return the email body
      return email;
    } catch (error) {
      // Forward the error if it's an instance of HttpException
      if (error instanceof HttpException) throw error;

      // Throw an internal server error if the error is not an instance of HttpException
      throw new InternalServerErrorException();
    }
  }
}
