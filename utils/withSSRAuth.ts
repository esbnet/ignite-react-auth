import {
	GetServerSideProps,
	GetServerSidePropsContext,
	GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";

type WithSSRAuthOptions = {
	permissions?: string[];
	roles?: string[];
};

export function withSSRAuth<P>(
	fn: GetServerSideProps<P>,
	options?: WithSSRAuthOptions
) {
    return async (
        ctx: GetServerSidePropsContext
        //@ts-ignore
	): Promise<GetServerSidePropsResult<P>> => {
		const cookies = parseCookies(ctx);

		if (!cookies["nextauth.token"]) {
			return {
				redirect: {
					destination: "/",
					permanent: false,
				},
			};
		}

		try {
			return await fn(ctx);
		} catch (error) {
			if (error instanceof AuthTokenError) {
				destroyCookie(ctx, "nextauth.token");
				destroyCookie(ctx, "nextauth.refreshToken");

				return {
					redirect: {
						destination: "/",
						permanent: false,
					},
				};
			}
		}
	};
}
