export interface Id {
  id: string;
}

export interface LooseObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface Query {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string] : any;
}

export interface FindOptions {
  fields?: string[];
  query?: Query;
  offset?: number;
  limit?: number;
  cursor?: unknown;
  sort?:string;
}

export interface PageData {
  current_offset: number;
  total: number;
  limit: number;
  next_offset:number;
  prev_offset:number;
}

