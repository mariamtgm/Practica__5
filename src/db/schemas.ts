import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { User, Message } from "../types.ts";

export type UserSchema = Omit<User, "id" | "token"> & {
  _id: ObjectId;
};

export type MessageSchema = Message & {
  _id: ObjectId;
};
