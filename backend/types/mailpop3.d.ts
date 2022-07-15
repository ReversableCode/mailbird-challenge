// This types file is written based on the following documentation:
// documentation: https://www.npmjs.com/package/mailpop3
// source_code: node_modules/mailpop3/main.js
// P.S. The types file is not complete. Only the types used in the backend are included.

declare module 'mailpop3' {
  // EventEmitter is used as a base class for POP3Client
  // reference: util.inherits(POP3Client, events.EventEmitter);
  import { EventEmitter } from 'events';

  export interface POP3Config {
    /**
     * If enabletls is true, the library will use a TLS connection.
     */
    enabletls: boolean;
    /**
     * If tlserrs is true, then TLS errors will be ignored.
     */
    ignoretlserrs: boolean;
    /**
     * The debug parameter prints out requests and responses.
     */
    debug: boolean;
  }

  export default class POP3Client extends EventEmitter {
    constructor(port: number, host: string, options: POP3Config);
    login(username: string, password: string): void;
    stls(): void;
    capa(): void;
    list(msgNumber?: number): void;
    top(msgNumber: number, lines: number): void;
    uidl(msgNumber?: number): void;
    retr(msgNumber: number): void;
    rset(): void;
    quit(): void;
  }
}
