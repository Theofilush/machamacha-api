export const exampleRequestLogin = {
  email: "[EMAIL_ADDRESS]",
  password: "[PASSWORD]",
};

export const exampleResponseLogin = {
  token: "jwt.access.token",
  refreshToken: "refresh.token.value",
  user: { id: "01HXYZ...", email: "user@example.com" },
};

export const exampleRequestRegister = {
  email: "[EMAIL_ADDRESS]",
  password: "[PASSWORD]",
};

export const exampleResponseRegister = {
  id: "01HXYZ...",
  email: "[EMAIL_ADDRESS]",
};
