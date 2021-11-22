export interface UserCreate {
  name: string;
  email: string;
  password: string;
  receive_notifications: boolean;
}

export interface UserGet extends UserCreate {
  id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Auth0UserCreate {
  email: string;
  email_verified: boolean;
  name: string;
  connection: string;
  password: string;
}

export interface Auth0User extends Auth0UserCreate {
  user_id: string;
  [key: string] : unknown;
}
