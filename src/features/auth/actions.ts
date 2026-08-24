"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  PORTAL_SESSION_COOKIE,
  createSignedPortalSession,
} from "./session";
import type { PortalSession } from "@/src/lib/auth/auth-provider";

export type LoginActionResult = {
  status: "idle" | "error" | "success";
  message?: string;
};

export const loginAction = async (
  _prevState: LoginActionResult,
  formData: FormData,
): Promise<LoginActionResult> => {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  const targetLocationId = (formData.get("locationId") as string) || "HNL-014";

  if (!email || !password) {
    return {
      status: "error",
      message: "Please enter your operator email and password.",
    };
  }

  // Demo login accounts
  let session: PortalSession | null = null;

  if (email === "operator@buddasdemo.com" && password === "AlohaBudda2026!") {
    session = {
      userId: "demo-operator-1",
      email: "operator@buddasdemo.com",
      role: "franchisee",
      locationId: "HNL-014",
      locationName: "La'ie Origin Grill",
      managedLocationIds: ["HNL-014"],
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    };
  } else if (email === "admin@buddasdemo.com" && password === "AlohaAdmin2026!") {
    session = {
      userId: "demo-admin-1",
      email: "admin@buddasdemo.com",
      role: "admin",
      locationId: targetLocationId,
      locationName: "La'ie Origin Grill",
      managedLocationIds: ["HNL-014", "OAH-207", "SLC-302"],
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    };
  }

  if (!session) {
    return {
      status: "error",
      message: "Invalid operator credentials. Please check your email and password.",
    };
  }

  const token = createSignedPortalSession(session);
  const cookieStore = await cookies();
  cookieStore.set(PORTAL_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24h
  });

  redirect("/portal");
};

export const logoutAction = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(PORTAL_SESSION_COOKIE);
  cookieStore.delete("sb-access-token");
  redirect("/franchise/login");
};
