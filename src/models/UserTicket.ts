export interface UserTicketCreate {
  email: string;
  ticketType: string;
}

export interface UserTicketGet {
  id: string;
  user_id: string;
  created_at: Date;
  ticket_type: string;
  time_to_live: number;
  status: string;
}


export interface TicketWithUserGet {
  id: string;
  user: {
      name: string;
      email: string;
  }
}

export interface ResetPasswordType {
  id: string;
  password: string;
}
