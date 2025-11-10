import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getLocalCurrentUser } from "@/lib/localAuth";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth:user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!res.ok) {
          throw new Error(await res.text());
        }
        return await res.json();
      } catch {
        return getLocalCurrentUser();
      }
    },
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
