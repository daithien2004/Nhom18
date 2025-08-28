export type LoginResponse = {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
};
