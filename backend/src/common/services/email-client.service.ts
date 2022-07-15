import { EmailDataDto } from '@/common/dtos/email-data.dto';
import { EmailConnectionDto } from '@/common/dtos/email-connection.dto';

export abstract class EmailClientService {
  /**
   * Connect to the email server and authenticate the user
   * @param emailConfig The email connection configuration
   */
  public abstract connect(emailConfig: EmailConnectionDto): Promise<void>;

  /**
   * Disconnect from the email server
   */
  public abstract disconnect(): void;

  /**
   * Fetches the email folders from the server.
   * @returns An array of email folders.
   */
  public abstract fetchEmailFolders(): Promise<string[]>;

  /**
   * Fetch email headers from the email server to display in the email list.
   * email headers include:
   * - email id
   * - email subject
   * - email sender
   * - email date
   * @param limit The number of emails to fetch from the server.
   * @param skip The number of emails to skip. This is useful for pagination.
   * @param mailbox the mailbox to fetch emails from (e.g. INBOX, Sent, Trash)
   * @returns An array of email headers.
   */
  public abstract fetchEmailHeaders(limit: number, skip?: number, mailbox?: string): Promise<EmailDataDto[]>;

  /**
   * Fetch an email by its id from the email server.
   * @param emailId The id of the email to fetch.
   * @param mailbox the mailbox to fetch emails from (e.g. INBOX, Sent, Trash)
   * @returns The email body.
   */
  public abstract fetchEmailById(emailId: string, mailbox?: string): Promise<EmailDataDto>;

  /**
   * Generate range of emails to fetch from the server.
   * @param total The total number of emails to fetch.
   * @param limit The number of emails to fetch from the server.
   * @param skip The number of emails to skip. This is useful for pagination.
   * @returns Computed range of emails to fetch.
   */
  public generateRangeOptions(total: number, limit: number, skip = 0) {
    const startRange = Math.max(1, total - skip);
    const endRange = Math.max(1, total - skip - limit);

    return { start: startRange, end: endRange, count: startRange - endRange };
  }
}
