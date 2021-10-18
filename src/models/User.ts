export interface UserCreate {
  name: string;
  email: string;
  password: string;
}

export interface UserGet extends UserCreate {
  id: string;
  created_at?: Date;
  updated_at?: Date;
}
