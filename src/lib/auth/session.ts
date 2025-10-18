"use server";

import { cache } from "react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const getCurrentSession = cache(async () => {
  const session = await auth();
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession();

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
});
