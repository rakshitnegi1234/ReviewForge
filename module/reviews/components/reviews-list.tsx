import { ExternalLink, GitPullRequest, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
          <Card key={review.id}>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="break-words text-lg">
                      {review.prTitle}
                    </CardTitle>
                    <Badge variant={isCompleted ? "secondary" : "destructive"}>
                      {review.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {review.repository.fullName} #{review.prNumber} ·{" "}
                    {review.createdAt.toLocaleString()}
                  </CardDescription>
                </div>

                <a
                  href={review.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Open PR
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </CardHeader>

            <CardContent>
              <ScrollArea className="max-h-80 rounded-md border bg-muted/30 p-4">
                <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {review.review}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
