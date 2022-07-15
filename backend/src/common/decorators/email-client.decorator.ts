import { BadRequestException, createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { EmailConnectionDto } from '@/common/dtos/email-connection.dto';
import { IMAPClientService } from '@/common/services/imap-client.service';
import { POP3ClientService } from '@/common/services/pop3-client.service';
import { EmailClientService } from '@/common/services/email-client.service';

export const EmailClient = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
  let client: EmailClientService;

  const session = ctx.switchToHttp().getRequest().session;
  const emailConfig = session.emailConfig as EmailConnectionDto;

  // Check if the email config is present in the session
  if (!emailConfig) throw new UnauthorizedException();

  // Generate the proper email client
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

  // Return the email client
  return client;
});
