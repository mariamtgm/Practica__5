export type User = {
    id: string;
    creationDate: string;
    email: string;
    language: string;
    name: string;
    password: string;
    surname: string;
    username: string;
    token?: string;
};

export type Message= {
    text: string;
    destinatario: string;
}
