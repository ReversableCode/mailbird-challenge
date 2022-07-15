import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailController } from '@/controllers/email.controller';
import config from '@/config';

@Module({
  controllers: [EmailController],
  providers: [],
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [config] })],
})
export class AppModule {}
