"use server";

import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export const getGithubToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    throw new Error("Unauthorized")
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github"
    }
  })

  if (!account?.accessToken) {
    throw new Error("No github access token found")
  }

  return account.accessToken;
}

type ContributionCalendar = {
  totalContributions: number
  weeks: {
    contributionDays: {
      contributionCount: number
      date: string
      color: string
    }[]
  }[]
}

type UserContributionResponse = {
  user: {
    contributionsCollection: {
      contributionCalendar: ContributionCalendar
    }
  }
}

  // {
  //   totalContributions: number;
  //   weeks: {
  //     contributionDays: {
  //       contributionCount: number;
  //       date: string;
  //       color: string;
  //     }[];
  //   }[];
  // } 
      
export async function fetchUserContribution(token: string, username: string) {
  const octokit = new Octokit({auth: token});

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await octokit.graphql<UserContributionResponse>(query, {
      username
    })

    return response.user.contributionsCollection.contributionCalendar
  } catch (error) {
    console.error("Error fetching user contribution:", error)
    throw error
  }
}


export const getRepositories = async (page: number = 1, perPage: number = 10) => {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    per_page: perPage,
    page: page,
  });

  return data;
};



export const createWebhook = async (owner: string, repo: string) => {
  
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL?.trim();

  if (!appBaseUrl) {
    throw new Error("NEXT_PUBLIC_APP_BASE_URL is required to create webhooks");
  }

  const webhookUrl = new URL("/api/webhooks/github", appBaseUrl).toString();

  const { data } = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    active: true,
    events: ["pull_request"],
    config: {
      url: webhookUrl,
      content_type: "json",
      insecure_ssl: "0",
    },
  });

  return data;
};

export async function getPullRequestDiff(
  token: string,
  owner: string,
  repo: string,
  prNumber: number
) {
  const octokit = new Octokit({ auth: token });


  //   title: "Fix dashboard button",
  //   body: "This PR fixes connect button state",
  //   state: "open",
  //   changed_files: 1,
  //   additions: 3,
  //   deletions: 1

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });


  // diff --git a/app/page.tsx b/app/page.tsx
  // - <button>Connect</button> ---- RED
  // + </button>-----GREEN

  const { data: diff } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: {
      format: "diff",
    },
  });

  return {
    diff: diff as unknown as string,
    title: pr.title,
    description: pr.body || "",
  };
}



export async function postReviewComment(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  review: string
) {
  const octokit = new Octokit({ auth: token });

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `## 🤖 AI Code Review\n\n${review}\n\n---\n*Powered by ReviewForge*`,
  });
}

export async function getRepoFileContents(
  token: string,
  owner: string,
  repo: string,
  path: string = ""
) {
  const octokit = new Octokit({ auth: token });
  const directoriesToScan = [path];
  const files = [];

  while (directoriesToScan.length > 0) {
    const currentPath = directoriesToScan.shift() ?? "";

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: currentPath,
    });

    if (!Array.isArray(data)) {
      // It's a file
      if (data.type === "file" && data.content && isRelevantRepoPath(data.path)) {
        files.push({
          path: data.path,
          content: Buffer.from(data.content, "base64").toString("utf-8"),
        });
      }

      continue;
    }

    for (const item of data) {
      if (item.type === "file" && item.path) {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: item.path,
        });

        if (
          !Array.isArray(fileData) &&
          fileData.type === "file" &&
          fileData.content
        ) {
          if (isRelevantRepoPath(item.path)) {
            files.push({
              path: item.path,
              content: Buffer.from(fileData.content, "base64").toString("utf-8"),
            });
          }
        }
      } else if (item.type === "dir" && item.path && !shouldSkipRepoDirectory(item.path)) {
        directoriesToScan.push(item.path);
      }
    }
  }

  return files;
}


function shouldSkipRepoDirectory(path: string) {
  return path
    .split("/")
    .some((part) =>
      [
        ".git",
        ".next",
        ".turbo",
        ".vercel",
        "coverage",
        "dist",
        "build",
        "out",
        "node_modules",
        "vendor",
      ].includes(part)
    );
}

function isRelevantRepoPath(path: string) {
  if (shouldSkipRepoDirectory(path)) {
    return false;
  }

  if (
    path.match(
      /\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|mp3|mp4|mov|webm|woff|woff2|ttf|lock)$/i
    )
  ) {
    return false;
  }

  return path.match(
    /\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdx|css|scss|html|yml|yaml|toml|prisma|sql|env|example|gitignore|c|cpp|h|hpp)$/i
  );
}
