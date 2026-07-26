import type { ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  GitPullRequest,
  MessageSquareText,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";

type Review = {
  id: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  review: string;
  status: string;
  createdAt: Date;
  repository: {
    fullName: string;
    owner: string;
    name: string;
  };
};

type ReviewsListProps = {
  reviews: Review[];
};

function renderInline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

function renderReview(review: string) {
  const lines = review.split("\n");
  const nodes: ReactNode[] = [];
  let codeBlock: string[] = [];
  let inCodeBlock = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        nodes.push(
          <pre
            key={`code-${index}`}
            className="my-4 overflow-x-auto rounded-lg border bg-background p-4 font-mono text-xs leading-relaxed text-foreground"
          >
            <code>{codeBlock.join("\n")}</code>
          </pre>
        );
        codeBlock = [];
      }

      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      codeBlock.push(line);
      return;
    }

    if (!trimmed) {
      nodes.push(<div key={`space-${index}`} className="h-3" />);
      return;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].replace(/^Code Review:\s*/i, "");
      const className =
        level <= 2
          ? "mt-1 text-lg font-semibold tracking-tight text-foreground"
          : "mt-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground";

      nodes.push(
        <h3 key={`heading-${index}`} className={className}>
          {renderInline(text)}
        </h3>
      );
      return;
    }

    const numbered = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numbered) {
      nodes.push(
        <div
          key={`numbered-${index}`}
          className="grid grid-cols-[1.75rem_1fr] gap-2 rounded-md py-1.5 text-sm leading-6"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {numbered[1]}
          </span>
          <p>{renderInline(numbered[2])}</p>
        </div>
      );
      return;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      nodes.push(
        <div
          key={`bullet-${index}`}
          className="grid grid-cols-[0.75rem_1fr] gap-2 py-1 text-sm leading-6"
        >
          <span className="mt-2 size-1.5 rounded-full bg-primary" />
          <p>{renderInline(bullet[1])}</p>
        </div>
      );
      return;
    }

    nodes.push(
      <p key={`paragraph-${index}`} className="text-sm leading-7 text-foreground">
        {renderInline(trimmed)}
      </p>
    );
  });

  return nodes;
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (!reviews.length) {
    return (
      <Empty className="min-h-64 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageSquareText />
          </EmptyMedia>
          <EmptyTitle>No reviews yet</EmptyTitle>
          <EmptyDescription>
            Pull request reviews will appear here after GitHub webhook runs.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4">
      {reviews.map((review) => {
        const isCompleted = review.status === "completed";

        return (
          <Card key={review.id} className="rounded-lg">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                      <GitPullRequest className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="break-words text-lg">
                          {review.prTitle}
                        </CardTitle>
                        <Badge
                          variant={isCompleted ? "secondary" : "destructive"}
                          className="gap-1"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {review.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-foreground/80">
                          {review.repository.fullName}
                        </span>
                        <span>PR #{review.prNumber}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {review.createdAt.toLocaleString()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <a
                      href={review.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  Open PR
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <ScrollArea className="max-h-[34rem] rounded-lg border bg-background">
                <div className="max-w-5xl space-y-1 p-5">
                  {renderReview(review.review)}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
