export interface TicketCreate {
    email: string;
    ticketType: string;
}


export interface TicketGet extends TicketCreate {
    id?: string;
    auth0Ticket? : string;
}


