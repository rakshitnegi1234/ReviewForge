// src/inngest/functions.ts
import prisma from "@/lib/db";
import { indexCodebase } from "@/module/ai/lib/rag";
import { getRepoFileContents } from "@/module/github/lib/github";
import { inngest } from "../client";

type RepositoryConnectedData = {
  owner: string;
  repo: string;
  userId: string;
};

export const indexRepo = inngest.createFunction(

  { id: "index-repo", triggers:
  { event: "repository.connected" } },


  async ({ event, step }) => {

    const { owner, repo, userId } = event.data as RepositoryConnectedData;

    // Files
    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          providerId: "github",
        },
      });

      if (!account?.accessToken) {
        throw new Error("No GitHub access token found");
      }

      return await getRepoFileContents(account.accessToken, owner, repo);
    });

    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}/${repo}`, files);
    });

    return { success: true, indexedFiles: files.length };
  }
);
