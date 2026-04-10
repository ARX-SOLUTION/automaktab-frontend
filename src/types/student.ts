export type CourseType = 'tezkor' | 'avto_maktab';
export type PaymentType = 'naqd' | 'karta';
export type DocumentStatus = '+' | '-';
export type ResultStatus = '✓' | '✗';

export interface Student {
  id: string;
  familya: string;
  ismi: string;
  telefon: string;
  kurs_narxi: number;
  course_type: CourseType;
  branch_id: string;
  branch_name?: string;
  tulov_turi: PaymentType;
  // Tezkor fields
  tolov?: number;
  qarzdorlik: number;
  dakument?: DocumentStatus;
  operator?: string;
  natijasi?: ResultStatus;
  izoh?: string;
  // Avto maktab fields
  boshlangich_tulov?: number;
  tulov_2?: number;
  tulov_3?: number;
  // Avto maktab detail
  guruh?: string;
  tugatish_sanasi?: string;
  shartnoma_raqami?: string;
  created_at: string;
}
