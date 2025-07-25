import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/api/apiAuth";
import { UserAdapted } from "@/utils/types";

export const useUsuarios = () => {
  return useQuery<UserAdapted[]>({
    queryKey: ["usuarios"],
    queryFn: () => AuthService.getUsers(100, 0),
  });
};