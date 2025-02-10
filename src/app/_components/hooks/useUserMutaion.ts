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

  const accessToken = user?.accessToken ?? null; // 追加: accessToken を取得

  return {
    user,
    refreshToken,
    accessToken, // 追加: accessToken を返す
    refetchUser,
    isUserLoading,
  };
};
