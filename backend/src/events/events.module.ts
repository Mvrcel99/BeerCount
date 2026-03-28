import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { StudentsModule } from '../students/students.module';
@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [StudentsModule],
  exports: [EventsService],
})
export class EventsModule {}
