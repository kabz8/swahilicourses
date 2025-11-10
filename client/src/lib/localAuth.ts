const USERS_KEY = "huJambo.localUsers";
const SESSION_KEY = "huJambo.currentUserId";

export interface LocalUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: "learner" | "admin" | "super_admin";
}

const hashPassword = (password: string) =>
  window.btoa(unescape(encodeURIComponent(password)));

const matchesPassword = (stored: string, candidate: string) =>
  stored === hashPassword(candidate);

const loadUsers = (): LocalUser[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LocalUser[];
  } catch {
    return [];
  }
};

const saveUsers = (users: LocalUser[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerLocalUser = (data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
}) => {
  const users = loadUsers();
  const existing = users.find(
    (user) => user.email.toLowerCase() === data.email.toLowerCase(),
  );
  if (existing) {
    throw new Error("A user with that email already exists.");
  }

  const newUser: LocalUser = {
    id: Date.now(),
    role: "learner",
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    password: hashPassword(data.password),
  };

  users.push(newUser);
  saveUsers(users);
  setLocalSession(newUser.id);
  return sanitize(newUser);
};

export const loginLocalUser = (email: string, password: string) => {
  const users = loadUsers();
  const user = users.find(
    (item) => item.email.toLowerCase() === email.toLowerCase(),
  );
  if (!user || !matchesPassword(user.password, password)) {
    throw new Error("Invalid credentials.");
  }
  setLocalSession(user.id);
  return sanitize(user);
};

export const getLocalCurrentUser = () => {
  if (typeof window === "undefined") return null;
  const sessionRaw = window.localStorage.getItem(SESSION_KEY);
  if (!sessionRaw) return null;
  const users = loadUsers();
  const user = users.find((item) => String(item.id) === sessionRaw);
  return user ? sanitize(user) : null;
};

export const logoutLocalUser = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
};

const setLocalSession = (userId: number) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, String(userId));
};

const sanitize = (user: LocalUser) => {
  const { password: _password, ...rest } = user;
  return rest;
};

