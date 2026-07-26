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




      //    // returns like 
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


// page and perpage is used for pagination 

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


// GitHub server jab ye URL dekhta hai:

// http://localhost:3000

// to localhost ka matlab hota hai:

// GitHub server ki apni machine


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
