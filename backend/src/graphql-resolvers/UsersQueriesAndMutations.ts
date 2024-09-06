import {
  Arg,
  Field,
  FieldResolver,
  Float,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { User } from "../entities/User";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";

@Resolver(User)
export class UserQueriesAndMutations {
  @Mutation((_) => User)
  async createUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("role") role: string
  ): Promise<User> {
    const hashedPassword: string = await argon2.hash(password);
    const user = new User(email, role, hashedPassword);
    await user.save();
    return user;
  }

  @Query((type) => String)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<string> {
    const hashedPassword: string = await argon2.hash(password);
    const user: User = await User.findOneOrFail({
      where: {
        email,
      },
    });
    const isValid: boolean = await argon2.verify(user.passwordHashed, password);
    if (!isValid) {
      throw new Error("password is incorrect");
    }

    const jwtSecret: string | undefined = process.env.JWT_SECRET;
    console.log("jwt secret : " + jwtSecret);
    if (!jwtSecret) {
      throw new Error("Invalid JWT secret");
    }
    const token: string = jwt.sign({ email, role: user.role }, jwtSecret);
    return token;
  }
}
