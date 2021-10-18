import { UserGet } from "./User";

export interface AccountUsersGet {
  account_id: string;
  users: UserGet[];
  created_at?: Date;
  updated_at?: Date;
}