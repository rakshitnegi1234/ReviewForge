"use server";

import { Octokit } from "octokit";
import { revalidatePath } from "next/cache";
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

function isGithubNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 404
  );
}

export async function getConnectedRepositories() {
  const session = await requireSession();

  return await prisma.repository.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });
}

export async function deleteConnectedRepository(repositoryId: string) {
  const session = await requireSession();

  const repository = await prisma.repository.findFirst({
    where: {
      id: repositoryId,
      userId: session.user.id,
    },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (!account?.accessToken) {
    throw new Error("No GitHub access token found");
  }

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL?.trim();

  if (!appBaseUrl) {
    throw new Error("NEXT_PUBLIC_APP_BASE_URL is required to delete webhooks");
  }

  const webhookUrl = new URL("/api/webhooks/github", appBaseUrl).toString();
  const octokit = new Octokit({ auth: account.accessToken });

  try {
    const webhooks = await octokit.paginate(octokit.rest.repos.listWebhooks, {
      owner: repository.owner,
      repo: repository.name,
      per_page: 100,
    });

    const matchingWebhooks = webhooks.filter((webhook) => {
      return webhook.config.url === webhookUrl;
    });

    await Promise.all(
      matchingWebhooks.map(async (webhook) => {
        try {
          await octokit.rest.repos.deleteWebhook({
            owner: repository.owner,
            repo: repository.name,
            hook_id: webhook.id,
          });
        } catch (error) {
          if (!isGithubNotFoundError(error)) {
            throw error;
          }
        }
      })
    );
  } catch (error) {
    if (!isGithubNotFoundError(error)) {
      throw error;
    }

    console.warn(
      `GitHub webhooks not found for ${repository.fullName}; deleting local data only.`
    );
  }

  await prisma.repository.delete({
    where: {
      id: repository.id,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/repository");
}
