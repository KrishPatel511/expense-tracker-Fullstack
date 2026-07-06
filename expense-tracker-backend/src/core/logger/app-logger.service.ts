import { Injectable, Logger } from '@nestjs/common';

// Abhi ke liye NestJS ka built-in Logger wrap kar rahe hain.
// Baad me isko Winston ya Pino jaisi library se replace kar sakta hai.
@Injectable()
export class AppLogger extends Logger {}
