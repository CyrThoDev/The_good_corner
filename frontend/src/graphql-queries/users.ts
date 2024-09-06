import { gql } from "@apollo/client";

export const USER_LOGIN_QUERY = gql`
  query LoginUser($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;
