"use client";

import React, { useEffect, useRef, useState } from "react";


import { ExternalLink, Search, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { RepositoryListSkeleton } from "@/module/repository/components/repository-skeleton";
import { useConnectRepository } from "@/module/repository/hooks/use-connectrepository";
import { useRepositories } from "@/module/repository/hooks/use-repositories";



interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics?: string[];
  isConnected?: boolean;
}


const RepositoryPage = () => {

  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    mutate: connectRepo,
    isPending: isConnecting,
    variables: connectingRepo,
  } = useConnectRepository();

  const observerTarget = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const allRepositories = data?.pages.flatMap((page) => page) ?? [];

  // SEARCH FILTER HAI

  const filteredRepositories = allRepositories.filter((repo: Repository) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = (repo: Repository) => {
    connectRepo({
      owner: repo.full_name.split("/")[0],
      repo: repo.name,
      githubId: repo.id,
    });
  };

  useEffect(() => {
    const target = observerTarget.current;

    if (!target || !hasNextPage || isFetchingNextPage) return;

    //  IntersectionObserver browser ka built-in API hai.  
    // Ye basically watch/listen karta hai ki koi element screen ke visible area me aa raha hai ya nahi.

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    // Browser, is target div ko watch karo.
  //   Jab ye viewport/screen me visible ho, callback run karna.

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);


  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
        Failed to load repositories.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
        <p className="text-muted-foreground">Manage and view all your GitHub repositories</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          className="pl-8"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredRepositories.map((repo: Repository) => {
          const isConnectingRepo =
            isConnecting && connectingRepo?.githubId === repo.id;

          return (
          <Card key={repo.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    <Badge variant="outline">{repo.language || "Unknown"}</Badge>
                    {repo.isConnected && <Badge variant="secondary">Connected</Badge>}
                  </div>
                  <CardDescription>{repo.description}</CardDescription>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    nativeButton={false}
                    variant="ghost"
                    size="icon"
                    render={
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleConnect(repo)}
                    disabled={repo.isConnected || isConnectingRepo}
                    variant={repo.isConnected ? "outline" : "default"}
                  >
                    {isConnectingRepo && <Spinner />}
                    {isConnectingRepo
                      ? "Connecting"
                      : repo.isConnected
                        ? "Connected"
                        : "Connect"}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                <span>{repo.stargazers_count.toLocaleString()} stars</span>
                <span>{repo.full_name}</span>
              </div>

              {!!repo.topics?.length && (
                <div className="flex flex-wrap gap-2">
                  {repo.topics.map((topic) => (
                    <Badge key={topic} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          );
        })}
      </div>

      {!filteredRepositories.length && (
        <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          No repositories found.
        </div>
      )}

      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && <RepositoryListSkeleton />}
        {!hasNextPage && allRepositories.length > 0 && (
          <p className="text-center text-muted-foreground">No More Repositories</p>
        )}
      </div>
    </div>
  );
};

export default RepositoryPage;
