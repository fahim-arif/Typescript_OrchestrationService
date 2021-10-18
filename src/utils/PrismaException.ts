export class PrismaException extends Error {
  message: string;
  description: unknown;
  code: string;

  constructor(code: string, message: string, description?: unknown) {
    super(message);

    this.code = code;
    this.message = message || 'Prisma Error';
    this.description = description || null;
  }
}
