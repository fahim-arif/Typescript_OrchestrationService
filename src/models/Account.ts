import {PageData} from '@models/Common';

export interface AccountCreate {
  email: string;
  company_name: string;
  handle: string;
  description?: string | null;
}

export interface AccountGet extends AccountCreate {
  id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PaginatedAccountList {
  accounts: AccountGet[];
  page_data? : PageData;
}
