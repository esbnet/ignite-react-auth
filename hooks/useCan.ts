import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

type UserCanParams = {
	permissions?: string[] | null | undefined;
	roles?: string[];
};

export function useCan({ permissions, roles }: UserCanParams) {
	const { user, isAuthenticated } = useContext(AuthContext);

	if (!isAuthenticated) {
		return false;
	}

	const userHasValidPermissions = validateUserPermissions({
		//@ts-ignore
		user, permissions, roles
	});

	return userHasValidPermissions;
}
