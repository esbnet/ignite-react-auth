import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

type UserCanParams = {
	permissions?: string[] | null | undefined;
	roles?: string[];
};

export function useCan({ permissions, roles }: UserCanParams) {
	const { user, isAuthenticated } = useContext(AuthContext);

	if (!isAuthenticated) {
		return false;
	}

	//@ts-ignore
	if (permissions?.length > 0) {
		const hasAllPermissions = permissions?.every((permission) => {
			return user?.permissions.includes(permission);
		});
		if (!hasAllPermissions) {
			return false;
		}
	}

	//@ts-ignore
	if (roles?.length > 0) {
		const hasAllroles = roles?.some((role) => {
			return user?.roles.includes(role);
		});
		if (!hasAllroles) {
			return false;
		}
	}

	return true;
}
