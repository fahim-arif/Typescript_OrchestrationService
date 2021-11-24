export interface TicketCreate {
    email: string;
    ticketType: string;
}


export interface Auth0Ticket {
    ticket: string;
}


export interface TicketGet {
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

