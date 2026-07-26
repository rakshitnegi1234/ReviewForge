import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteConnectedRepository } from "@/module/settings/actions";
import { DeleteRepositoryButton } from "./delete-repository-button";

type ConnectedRepository = {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  url: string;
  _count: {
    reviews: number;
  };
};

type RepositorySettingsProps = {
  repositories: ConnectedRepository[];
};

export function RepositorySettings({
  repositories,
}: RepositorySettingsProps) {
  if (!repositories.length) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        No connected repositories.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {repositories.map((repository) => (
        <Card key={repository.id}>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="break-all text-lg">
                    {repository.fullName}
                  </CardTitle>
                  <Badge variant="secondary">
                    {repository._count.reviews} reviews
                  </Badge>
                </div>
                <CardDescription>{repository.url}</CardDescription>
              </div>

              <form action={deleteConnectedRepository.bind(null, repository.id)}>
                <DeleteRepositoryButton />
              </form>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {repository.owner}/{repository.name}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
