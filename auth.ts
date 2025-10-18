"use server";

import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth/config";

const authResult = NextAuth(authConfig);

export const auth = authResult.auth;
export const signIn = authResult.signIn;
export const signOut = authResult.signOut;
export const GET = authResult.handlers.GET;
export const POST = authResult.handlers.POST;
