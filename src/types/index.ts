export * from './teacher';
export * from './student';
export * from './schedule';
export * from './billing';

export interface AppData {
  teachers: Teacher[];
  students: Student[];
  schedules: Schedule[];
  lastBackup?: string;
  version: string;
}

import { Teacher } from './teacher';
import { Student } from './student';
import { Schedule } from './schedule';
