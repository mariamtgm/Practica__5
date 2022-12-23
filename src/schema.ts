import { gql } from "graphql_tag";

export const typeDefs = gql`
  type UserSchema {
    id: ID!
    surname: String!
    password: String!
    email: String!
    date: String!
    language: String!
    token: String
  }

  type MessageSchema {
    id: ID!
    text: String!
    destinatario: String!
  }


  type Mutation {
      createUser(creationDate: String!, email: String!, language: String!, name: String!, password: String!, surname: String!, username: String!): UserSchema!
      login(username: String!, password: String!): String!
      deleteUser(surname: String!, email: String!): String!
      sendMessage(destino: string!, message: string!): Message! 
    }

    type Query {
      Me(token: String!): User!
    }
`;



