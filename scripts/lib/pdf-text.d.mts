export const RESUME_NAME: string;
export const RESUME_EMAIL: string;
export const RESUME_MAX_PAGES: number;
export const RESUME_HEADINGS: string[];
export const PHONE_PATTERN: RegExp;
export function pdfText(path: string): Promise<{ pages: number; text: string }>;
export function checkResumePdf(pdf: { pages: number; text: string }): string[];
