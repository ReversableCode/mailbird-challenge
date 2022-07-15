/* eslint-disable @typescript-eslint/no-unused-vars */
import pEvent from 'p-event';
import POP3Client from 'mailpop3';
import { simpleParser } from 'mailparser';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { EmailDataDto } from '@/common/dtos/email-data.dto';
import { EmailConnectionDto } from '@/common/dtos/email-connection.dto';
import { EmailClientService } from '@/common/services/email-client.service';

export class POP3ClientService extends EmailClientService {
  private POP3Client: POP3Client;

  public connect(emailConfig: EmailConnectionDto): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Setup the POP3 client
        this.setupPOP3Client(emailConfig);

        // Connect to the POP3 server
        const [connectStatus, connectMessage] = await pEvent(this.POP3Client, 'connect', { multiArgs: true });

        // Failed to connect to the POP3 server
        if (!connectStatus) throw new InternalServerErrorException(connectMessage);

        // If encryption is set to STARTTLS, then we need to upgrade the connection
        if (emailConfig.encryption === 'STARTTLS') {
          // Check if server supports STARTTLS
          this.POP3Client.capa();
          const [capaStatus, capaList] = await pEvent(this.POP3Client, 'capa', { multiArgs: true });

          // If the server does support STARTTLS, then upgrade the connection
          if (capaStatus && capaList.includes('STLS')) {
            // Upgrade the connection
            this.POP3Client.stls();
            const [stlsStatus, stlsMessage] = await pEvent(this.POP3Client, 'stls', { multiArgs: true });

            // Failed to upgrade the connection
            if (!stlsStatus) throw new InternalServerErrorException(stlsMessage);
          }
        }

        // Login to the POP3 server
        this.POP3Client.login(emailConfig.user, emailConfig.password);
        const [loginStatus, loginMessage] = await pEvent(this.POP3Client, 'login', { multiArgs: true });

        // Failed to login to the POP3 server
        if (!loginStatus) throw new InternalServerErrorException(loginMessage);

        // Resolve the promise
        resolve();
      } catch (error) {
        // Disconnect from the POP3 server
        this.disconnect();

        // Reject the promise
        reject(this.handlePOP3ClientError(error));
      }
    });
  }

  public disconnect(): void {
    // Close the POP3 client
    this.POP3Client.quit();
  }

  public fetchEmailFolders(): Promise<string[]> {
    // According to rfc1939, the POP3 protocol only supports one mailbox
    // source: https://datatracker.ietf.org/doc/html/rfc1939#section-8
    return Promise.resolve(['INBOX']);
  }

  public fetchEmailHeaders(limit: number, skip = 0, _mailbox = 'INBOX'): Promise<EmailDataDto[]> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get the number of emails in the mailbox
        this.POP3Client.list();
        const [listStatus, emailCount, , , listMessage] = await pEvent(this.POP3Client, 'list', {
          multiArgs: true,
        });

        // Failed to get the number of emails in the mailbox
        if (!listStatus) throw new InternalServerErrorException(listMessage);

        // If the number of emails is 0, then return an empty array
        if (emailCount === 0) {
          // Disconnect from the POP3 server
          this.disconnect();

          // Resolve the promise with an empty array
          resolve([]);
        }

        // Generate the range options
        const { start, end } = this.generateRangeOptions(emailCount, limit, skip);

        // Get the emails from the mailbox
        const emails = await this.getEmailHeaders(start, end);

        // Disconnect from the POP3 server
        this.disconnect();

        // Resolve the promise with the emails
        resolve(
          emails.map((email) => ({
            messageId: email.messageId,
            subject: email.subject,
            from: email.from,
            date: email.date,
          })),
        );
      } catch (error) {
        // Disconnect from the POP3 server
        this.disconnect();

        // Reject the promise
        reject(this.handlePOP3ClientError(error));
      }
    });
  }

  public fetchEmailById(emailId: string, _mailbox = 'INBOX'): Promise<EmailDataDto> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get UIDL of the emails from the POP3 server
        this.POP3Client.uidl();
        const [uidlStatus, , uidlList, uidlMessage] = await pEvent(this.POP3Client, 'uidl', {
          multiArgs: true,
        });

        // Failed to get the UIDL of the emails from the POP3 server
        if (!uidlStatus) throw new InternalServerErrorException(uidlMessage);

        // Get the email number from the UIDL list
        const emailNumber = uidlList.findIndex((uidl) => uidl === emailId) as number;

        // Failed to get the email number from the UIDL list
        if (emailNumber === -1) throw new InternalServerErrorException('Requested email not found');

        // Get the email from the mailbox
        this.POP3Client.retr(emailNumber);
        const [retrStatus, , emailBody, retrMessage] = await pEvent(this.POP3Client, 'retr', {
          multiArgs: true,
        });

        // Failed to get the email from the mailbox
        if (!retrStatus) throw new InternalServerErrorException(retrMessage);

        // Reset the mailbox. Undelete deleted emails
        this.POP3Client.rset();
        await pEvent(this.POP3Client, 'rset');

        // Disconnect from the POP3 server
        this.disconnect();

        // Parse the email body using simpleParser
        const parsedEmail = await simpleParser(emailBody);

        // Resolve the promise with the email
        resolve({
          messageId: emailId,
          from: parsedEmail.from?.text,
          subject: parsedEmail.subject,
          date: parsedEmail.date,
          text: parsedEmail.text,
          html: parsedEmail.html,
        });
      } catch (error) {
        // Disconnect from the POP3 server
        this.disconnect();

        // Reject the promise
        reject(this.handlePOP3ClientError(error));
      }
    });
  }

  /**
   * Setup POP3 client
   * @param emailConfig The email connection configuration
   */
  private setupPOP3Client(emailConfig: EmailConnectionDto) {
    // Create POP3 client
    this.POP3Client = new POP3Client(emailConfig.port, emailConfig.host, {
      enabletls: emailConfig.encryption === 'SSL/TLS',
      ignoretlserrs: true,
      debug: false,
    });
  }

  /**
   * Retrieve the email headers from the POP3 server
   * @param start The start index of the range
   * @param end The end index of the range
   * @returns The emails from the mailbox
   */
  private async getEmailHeaders(start: number, end: number): Promise<EmailDataDto[]> {
    // List of emails to be returned
    const emailsList: EmailDataDto[] = [];

    for (let id = start; id >= end; id--) {
      // Get the email from the mailbox
      this.POP3Client.top(id, 0);
      const [topStatus, , emailHeader, topMessage] = await pEvent(this.POP3Client, 'top', { multiArgs: true });

      // Failed to get the email from the mailbox
      if (!topStatus) throw new InternalServerErrorException(topMessage);

      // Get UIDL of the emails from the POP3 server
      this.POP3Client.uidl();
      const [uidlStatus, , uidlList, uidlMessage] = await pEvent(this.POP3Client, 'uidl', {
        multiArgs: true,
      });

      // Failed to get the UIDL of the emails from the POP3 server
      if (!uidlStatus) throw new InternalServerErrorException(uidlMessage);

      // Parse the email body using simpleParser
      const parsedEmail = await simpleParser(emailHeader);

      // Add the email to the list
      emailsList.push({
        messageId: uidlList[id],
        from: parsedEmail.from?.text,
        subject: parsedEmail.subject,
        date: parsedEmail.date,
        text: parsedEmail.text,
        html: parsedEmail.html,
      });
    }

    // Return the emails list
    return emailsList;
  }

  /**
   * Disconnect from the POP3 server return the proper error message
   * @param error The error to handle.
   */
  private handlePOP3ClientError(error: Error) {
    // Disconnect from the POP3 server
    this.disconnect();

    // Check if the error is an HTTP error, if so, then return it
    if (error instanceof HttpException) return error;

    // Return a generic error
    return new InternalServerErrorException(error.message);
  }
}
