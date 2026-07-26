"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { connectRepository } from "../actions";

type ConnectRepositoryInput = {
  owner: string;
  repo: string;
  githubId: number;
};


  // useMutation is used for actions that change data, like creating a webhook or saving a repo.

  // useQueryClient gives access to React Query cache, so after connecting a repo you can refresh the repo list.

export const useConnectRepository = () => {

  const queryClient = useQueryClient();

  return useMutation({
    
    mutationFn: async ({ owner, repo, githubId }: ConnectRepositoryInput) => {
      return await connectRepository(owner, repo, githubId);
    },
    onSuccess: () => {
      toast.add({
        title: "Repository connected successfully",
        type: "success",
      });

      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: (error) => {
      toast.add({
        title: "Failed to connect repository",
        type: "error",
      });

      console.error(error);
    },
  });
};
