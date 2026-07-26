import { NextResponse, type NextRequest } from "next/server";
import { reviewPullRequest } from "@/module/ai/actions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = req.headers.get("x-github-event");

    if (event === "ping") {
      return NextResponse.json({ message: "Pong" }, { status: 200 });
    }

    if (event === "pull_request") {
      const action = body.action;
      const repo = body.repository?.full_name;
      const prNumber = body.number;

      if (
        (action === "opened" || action === "synchronize") &&
        typeof repo === "string" &&
        typeof prNumber === "number"
      ) {
        const [owner, repoName] = repo.split("/");

        reviewPullRequest(owner, repoName, prNumber)
          .then(() =>
            console.log(`Review completed for ${repo} #${prNumber}`)
          )
          .catch((error) =>
            console.log(`Review failed for ${repo} #${prNumber}:`, error)
          );
      }
    }

    console.log("GitHub webhook event:", event, body);

    // TODO: HANDLE LATER

    return NextResponse.json({ message: "Event Processes" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
