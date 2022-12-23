import { ObjectId } from "mongo";
import { MessagesCollection, UsersCollection } from "../db/mongo.ts";
import { MessageSchema, UserSchema } from "../db/schemas.ts";
import { Message, User } from "../types.ts";
import * as bcrypt from "bcrypt";
import { createJWT, verifyJWT } from "../lib/jwt.ts";

export const Mutation = {
  createUser: async (
    _parent: unknown,
    args: User,
  ): Promise<UserSchema & { token: string }> => {
    try {
      const user: UserSchema | undefined = await UsersCollection.findOne({
        username: args.username,
      });

      if (user) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(args.password);
      const _id = new ObjectId();
      const token = await createJWT(
        {
          username: args.username,
          email: args.email,
          name: args.name,
          surname: args.surname,
          id: _id.toString(),
          creationDate: args.creationDate,
          language: args.language,
          password: ""
        },
        Deno.env.get("JWT_SECRET")!
      );
      const newUser: UserSchema = {
        _id,
        username: args.username,
        email: args.email,
        password: hashedPassword,
        name: args.name,
        surname: args.surname,
        creationDate: args.creationDate,
        language: args.language
      };
      await UsersCollection.insertOne(newUser);
      return {
        ...newUser,
        token,
      };
    } catch (e) {
      throw new Error(e);
    }
  },
  login: async (
    _parent: unknown,
    args: {
      username: string;
      password: string;
    }
  ): Promise<string> => {
    try {
      const user: UserSchema | undefined = await UsersCollection.findOne({
        username: args.username,
      });
      if (!user) {
        throw new Error("Invalid credentials");
      }
      const validPassword = await bcrypt.compare(args.password, user.password || "");
      if (!validPassword) {
        throw new Error("Invalid credentials");
      }

      const token = await createJWT(
        {
          username: user.username,
          email: user.email,
          name: user.name,
          surname: user.surname,
          creationDate: user.creationDate,
          language: user.language,
          password: user.password,
          id: user._id.toString(),
        },
        Deno.env.get("JWT_SECRET")!
      );

      return token;
    } catch (e) {
      throw new Error(e);
    }
  },
  deleteUser: async (
    _parent: unknown,
    args: {
    username: string;
    email: string,
    },
    ctx: {
      auth: string;
    }
  ): Promise<string> => {
    try {

      const validtoken = await verifyJWT(ctx.auth, "my-super-secret"|| "");
      if (!validtoken) {
        throw new Error("Invalid credentials");
      }

      const user: UserSchema | undefined = await UsersCollection.findOne({
        username: args.username,
        email: args.email
      });
      if (!user) {
        throw new Error("User does not exist");
      }
      
      await UsersCollection.deleteOne({user});
      return "User deleted";

    } catch (e) {
      throw new Error(e);
    }
  },
  sendMessage: async (
    _: unknown,
    args: {
      destinatario: string;
      text: string;
      username: string;
    },
    ctx:{
      auth:string;
  }
  ): Promise<Message> => {
    try {

      if(!ctx.auth){
        throw new Error("Invalid credentials");
      }
      
      if(!args.destinatario){
        throw new Error("Please introduce the receiver");
      }

      const validtoken = await verifyJWT(ctx.auth, "my-super-secret"|| "");
      if (!validtoken) {
        throw new Error("Invalid credentials");
      }

      const user: UserSchema | undefined = await UsersCollection.findOne({
        username: args.username,
      });
      if (!user) {
        throw new Error("User does not exist");
      }

      const destination: UserSchema | undefined = await UsersCollection.findOne({
        username: args.destinatario,
      });
      if(!destination){
        throw new Error("Destination does not exist");
      } 
      const _id = new ObjectId();
      const newMessage: MessageSchema = {
        _id,
        destinatario: args.destinatario,
        text: args.text,
      }
    
      await MessagesCollection.insertOne(newMessage);
      return {
        ...newMessage,
      };
      
    } catch (e) {
      throw new Error(e);
    }
  },
};    