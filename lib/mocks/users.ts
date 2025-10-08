export type UserRole = "admin" | "owner" | "user";

export interface MockUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export const mockUsers: MockUser[] = [
  {
    email: "admin@example.com",
    password: "admin123",
    name: "Admin Account",
    role: "admin",
  },
  {
    email: "owner@example.com",
    password: "owner123",
    name: "Owner Account",
    role: "owner",
  },
  {
    email: "user@example.com",
    password: "user123",
    name: "User Account",
    role: "user",
  },
];

export function findMockUser(email: string, password: string) {
  return mockUsers.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );
}
