import type { AuthUser } from "../types/models";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";
import { logAction } from "./imsApi";

const AUTH_STORAGE_KEY = "ims_current_user";

type AuthListener = (user: AuthUser | null) => void;

interface MockUser extends AuthUser {
  password: string;
  username: string;
}

const mockUsers: MockUser[] = [
  {
    id: "user-admin",
    email: "admin@msmedsupply.com",
    role: "Administrator",
    displayName: "J. Laster",
    username: "jlaster",
    password: "medsupply",
  },
  {
    id: "user-warehouse",
    email: "warehouse@msmedsupply.com",
    role: "Warehouse Lead",
    displayName: "Warehouse Ops",
    username: "warehouse",
    password: "warehouse",
  },
];

let currentUser: AuthUser | null = loadAuthUser();
const listeners = new Set<AuthListener>();

export function getCurrentUser() {
  return currentUser;
}

export async function signIn(identifier: string, password: string) {
  const normalized = (identifier || "").trim().toLowerCase();
  if (!normalized || !password) {
    throw new Error("Enter your username and password.");
  }
  const isEmail = normalized.includes("@");

  if (isSupabaseConfigured && isEmail) {
    try {
      const { data, error } = await getSupabaseClient().auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (error || !data?.user) throw error || new Error("Invalid credentials");
      currentUser = {
        id: data.user.id,
        email: data.user.email || normalized,
        role: (data.user.user_metadata?.role as string) || "User",
        displayName: data.user.user_metadata?.displayName || data.user.email || normalized,
      };
      persistAuthUser(currentUser);
      notifyAuthListeners();
      await logAction("auth.signIn", { id: currentUser.id, email: currentUser.email });
      return currentUser;
    } catch (error) {
      console.warn("Supabase sign-in failed. Falling back to mock auth.", error);
    }
  }

  const match = mockUsers.find(
    (user) =>
      (user.email.toLowerCase() === normalized || user.username.toLowerCase() === normalized) &&
      user.password === password
  );
  if (!match) {
    throw new Error("Invalid credentials.");
  }
  currentUser = {
    id: match.id,
    email: match.email,
    role: match.role,
    displayName: match.displayName,
  };
  persistAuthUser(currentUser);
  notifyAuthListeners();
  await logAction("auth.signIn", { id: match.id, email: match.email });
  return currentUser;
}

export async function signOut() {
  if (isSupabaseConfigured) {
    try {
      await getSupabaseClient().auth.signOut();
    } catch (error) {
      console.warn("Supabase sign-out failed.", error);
    }
  }
  await logAction("auth.signOut", { id: currentUser?.id });
  currentUser = null;
  persistAuthUser(null);
  notifyAuthListeners();
}

export function onAuthStateChange(listener: AuthListener) {
  listeners.add(listener);
  listener(currentUser);
  return () => listeners.delete(listener);
}

function notifyAuthListeners() {
  listeners.forEach((listener) => listener(currentUser));
}

function persistAuthUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

function loadAuthUser(): AuthUser | null {
  return null;
}
