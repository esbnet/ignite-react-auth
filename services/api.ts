import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

const cookies = parseCookies();

export const api = axios.create({
	baseURL: "http://localhost:3333",
	headers: {
		Authorization: `Bearer ${cookies["nextauth.token"]}`,
	},
});

api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error: AxiosError) => {
		// @ts-ignore
		const {status} = error.response;
		// @ts-ignore
		const {code} = error.response.data;

		if (status === 401) {
			if (code === "token.expired") {
				const cookies = parseCookies();
				const { "nextauth.refreshToken": refreshToken } = cookies;

				api
					.post("/refresh", {
						refreshToken,
					})
					.then((response) => {
						const { token } = response.data ;
						console.log('Token:' + response)
						setCookie(null || undefined, "nextauth.token", token, {
							maxAge: 60 * 60 * 24 * 30, // 30 days
							path: "/",
						});

						setCookie(
							null || undefined,
							"nextauth.refreshToken",
							response.data.refreshToken,
							{
								maxAge: 60 * 60 * 24 * 30, // 30 days
								path: "/",
							}
						);
						api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
					});
			} else {
			}
		}
	}
);
