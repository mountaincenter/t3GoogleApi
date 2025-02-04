"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";

export const useUserMutation = () => {
  const { data: session } = useSession();

  // 現在のユーザー情報を取得するクエリ
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = api.user.getUserById.useQuery(undefined, {
    enabled: !!session?.user?.id,
  });

  const refreshToken =
    user?.accounts?.find((account) => account.provider === "google")
      ?.refresh_token ?? null;

  return {
    user,
    refreshToken,
    refetchUser,
    isUserLoading,
  };
};
