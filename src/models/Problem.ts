export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: unknown;
  instance: string;
}
