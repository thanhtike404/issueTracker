import { fetchProfile } from "@/services/profileService";
import { useQuery } from "@tanstack/react-query";
import { UserWithIssues } from "@/types/user";
export const useProfile = (id: string) => {
  return  useQuery<UserWithIssues | null>({
  queryKey: ["profile", id],
  queryFn: () => fetchProfile(id),
  refetchOnWindowFocus: false,
});
};