/* eslint-disable @typescript-eslint/no-unused-vars */
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { EmailDataDto } from '@/common/dtos/email-data.dto';
import { EmailConnectionDto } from '@/common/dtos/email-connection.dto';
import { EmailClientService } from '@/common/services/email-client.service';

export class IMAPClientService extends EmailClientService {
  private IMAPClient: Imap;

  public connect(emailConfig: EmailConnectionDto): Promise<void> {
    return new Promise((resolve, reject) => {
      // Setup the IMAP client
      this.setupIMAPClient(emailConfig);

      // Resolve the promise when the client is connected
      this.IMAPClient.once('ready', () => resolve());

      // Reject the promise if an error occurs
      this.IMAPClient.once('error', (error: Error) => reject(this.handleIMAPClientError(error)));

      // Connect to the IMAP server
      this.IMAPClient.connect();
    });
  }

  public disconnect(): void {
    // Close the IMAP client
    this.IMAPClient.end();
  }

  public fetchEmailFolders(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.IMAPClient.getBoxes((error, boxes) => {
        // Reject if an error occurs while fetching the folders
        if (error) return reject(this.handleIMAPClientError(error));

        // Disconnect from the IMAP server
        this.disconnect();

        // Resolve the promise with the folders
        return resolve(Object.keys(boxes));
      });
    });
  }

  public fetchEmailHeaders(limit: number, skip = 0, mailbox = 'INBOX'): Promise<EmailDataDto[]> {
    return new Promise((resolve, reject) => {
      // Open the mailbox and fetch the emails
      this.IMAPClient.openBox(mailbox, true, (error, box) => {
        // Reject if an error occurs while opening the mailbox
        if (error) return reject(this.handleIMAPClientError(error));

        // Generate the range options
        const { start, end, count } = this.generateRangeOptions(box.messages.total, limit, skip);

        // Create a stream to fetch the emails
        const dataStream = this.IMAPClient.seq.fetch(`${start}:${end}`, {
          bodies: 'HEADER.FIELDS (FROM SUBJECT DATE)',
        });

        // Parse the emails from the stream
        this.parseEmailsFromStream(dataStream, count)
          // Resolve the promise with the email headers
          .then((emails) => {
            // Disconnect from the IMAP server
            this.disconnect();

            // Resolve the promise with the email headers
            resolve(
              emails.map((email) => ({
                messageId: email.messageId,
                subject: email.subject,
                from: email.from,
                date: email.date,
              })),
            );
          })
          // Reject the promise if an error occurs
          .catch((error) => reject(this.handleIMAPClientError(error)));
      });
    });
  }

  public fetchEmailById(emailId: string, mailbox = 'INBOX'): Promise<EmailDataDto> {
    return new Promise((resolve, reject) => {
      // Open the mailbox and fetch the email with the given ID
      this.IMAPClient.openBox(mailbox, true, (error) => {
        // Reject if an error occurs while opening the mailbox
        if (error) return reject(this.handleIMAPClientError(error));

        // Create a stream to fetch the email
        const dataStream = this.IMAPClient.fetch(emailId, { bodies: '' });

        // Parse the emails from the stream
        this.parseEmailsFromStream(dataStream, 1)
          // Resolve the promise with the email body
          .then((emails) => {
            // Disconnect from the IMAP server
            this.disconnect();

            // Resolve the promise with the email body
            resolve(emails[0]);
          })
          // Reject the promise if an error occurs
          .catch((error) => reject(this.handleIMAPClientError(error)));
      });
    });
  }

  /**
   * Setup IMAP client
   * @param emailConfig The email connection configuration
   */
  private setupIMAPClient(emailConfig: EmailConnectionDto) {
    // Object to store the IMAP client configuration
    const config: Imap.Config = {
      user: emailConfig.user,
      password: emailConfig.password,
      host: emailConfig.host,
      port: emailConfig.port,
    };

    // If encryption is set to SSL/TLS, add it to the config
    if (emailConfig.encryption === 'SSL/TLS') {
      config.tls = true;
      config.tlsOptions = {
        rejectUnauthorized: false,
        servername: emailConfig.host,
      };
    }

    // If encryption is set to STARTTLS, add it to the config
    if (emailConfig.encryption === 'STARTTLS') config.autotls = 'required';

    // Create IMAP client
    this.IMAPClient = new Imap(config);
  }

  /**
   * Parse emails from a stream
   * @param dataStream The stream to parse the emails from.
   * @param count The number of emails to parse from the stream.
   * @returns Array of emails.
   */
  private parseEmailsFromStream(dataStream: Imap.ImapFetch, count: number): Promise<EmailDataDto[]> {
    return new Promise((resolve, reject) => {
      // List of emails to be returned
      const emailsList: EmailDataDto[] = [];

      // Reject when an error occurs while fetching the emails
      dataStream.once('error', (error: Error) => reject(this.handleIMAPClientError(error)));

      // Fetch the emails from the stream and parse them
      dataStream.on('message', (message: Imap.ImapMessage) => {
        // Create a buffer to store the chunks of the email body
        let buffer = '';

        // Create a variable to store the email attributes
        let attributes: Imap.ImapMessageAttributes;

        // Save the email attributes for later use
        message.on('attributes', (attrs) => (attributes = attrs));

        // Accumulate the chunks of the email body
        message.on('body', (stream) => stream.on('data', (chunk) => (buffer += chunk.toString('utf8'))));

        // Process the email body when the stream is done
        message.once('end', async () => {
          // Parse the email body using simpleParser
          const parsedEmail = await simpleParser(buffer);

          // Add the email to the list
          emailsList.push({
            messageId: attributes.uid.toString(),
            from: parsedEmail.from?.text,
            subject: parsedEmail.subject,
            date: parsedEmail.date,
            text: parsedEmail.text,
            html: parsedEmail.html,
          });

          // If all the data items have been streamed, resolve the promise
          if (emailsList.length === count) resolve(emailsList.reverse());
        });
      });
    });
  }

  /**
   * Disconnect from the IMAP server return the proper error message
   * @param error The error to handle.
   */
  private handleIMAPClientError(error: Error) {
    // Disconnect from the IMAP server
    this.disconnect();

    // Check if the error is an HTTP error, if so, then return it
    if (error instanceof HttpException) return error;

    // Return a generic error
    return new InternalServerErrorException(error.message);
  }
}
