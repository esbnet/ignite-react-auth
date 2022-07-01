import axios, { AxiosError } from "axios";
import { setCookie, parseCookies } from "nookies";
import { singnOut } from "../contexts/AuthContext";

let cookies = parseCookies();
let isRefreshing = false;
let failRequestQueue: any = [];

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
		const { status } = error.response;
		// @ts-ignore
		const { code } = error.response.data;
		if (status === 401) {
			if (code === "token.expired") {
				const cookies = parseCookies();
				const { "nextauth.refreshToken": refreshToken } = cookies;

				const originalConfig = error.config;

				if (!isRefreshing) {
					isRefreshing = true;

					api
						.post("/refresh", {
							refreshToken,
						})
						.then((response) => {
							const { token } = response.data;
							console.log("Token:" + response);
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
							// @ts-ignore
							api.defaults.headers["Authorization"] = `Bearer ${token}`;

							failRequestQueue.forEach((request: any) =>
								request.onSuccess(token)
							);
							failRequestQueue = [];
						})
						.catch((err) => {
							failRequestQueue.forEach((request: any) =>
								request.onSuccess(err)
							);
							failRequestQueue = [];
						})
						.finally(() => {
							isRefreshing = false;
						});
				}

				return new Promise((resolve, reject) => {
					failRequestQueue.push({
						onSuccess: (token: string) => {
							// @ts-ignore
							originalConfig.headers["Authorization"] = `Bearer $(token)`;

							resolve(api(originalConfig));
						},
						onFailure: (err: AxiosError) => {
							reject(err);
						},
					});
				});
			} else {
				singnOut();
			}
		}
		return Promise.reject(error);
	}
);
