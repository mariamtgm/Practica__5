import { Server } from "std/http/server.ts";
import { GraphQLHTTP } from "gql";
import { makeExecutableSchema } from "graphql_tools";
import { Header } from "https://deno.land/x/djwt@v2.8/mod.ts";

// import { Query } from "./resolvers/query.ts";
import { Mutation } from "./resolvers/mutation.ts";
import { typeDefs } from "./schema.ts";
// import UserResolvers from "./resolvers/user.ts";
const resolvers = {
  // Query,
  Mutation,
  // User: UserResolvers,
};

const s = new Server({
  handler: async (req) => {
    const { pathname } = new URL(req.url);

    return pathname === "/graphql"
      ? await GraphQLHTTP<Request>({
          schema: makeExecutableSchema({ resolvers, typeDefs }),
          graphiql: true,
          context: (req) => {
            const auth = req.headers.get("auth") || "";
            return {
                auth: auth
            }
          }
        })(req)
      : new Response("Not Found", { status: 404 });
  },
  port: 3000,
});

s.listenAndServe();

console.log(`Server running on: http://localhost:3000/graphql`);