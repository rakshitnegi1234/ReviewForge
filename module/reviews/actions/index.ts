"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function getReviews() {
  const session = await requireSession();

  return await prisma.review.findMany({
    where: {
      repository: {
        userId: session.user.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      repository: {
        select: {
          fullName: true,
          owner: true,
          name: true,
        },
      },
    },
  });
}
