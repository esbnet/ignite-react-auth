import axios, { AxiosError } from "axios";
import { setCookie, parseCookies } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false;
//@ts-ignore
let failedRequestsQueue = [];

export function setupApiClient(ctx: undefined) {
	let cookies = parseCookies(ctx);

	const api = axios.create({
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
					const cookies = parseCookies(ctx);
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
								setCookie(ctx, "nextauth.token", token, {
									maxAge: 60 * 60 * 24 * 30, // 30 days
									path: "/",
								});
								setCookie(
									ctx,
									"nextauth.refreshToken",
									response.data.refreshToken,
									{
										maxAge: 60 * 60 * 24 * 30, // 30 days
										path: "/",
									}
								);
								// @ts-ignore
								api.defaults.headers["Authorization"] = `Bearer ${token}`;
								//@ts-ignore
								failedRequestsQueue.forEach((request) =>
									request.onSuccess(token)
								);
								failedRequestsQueue = [];
							})
							.catch((err) => {
								//@ts-ignore
								failedRequestsQueue.forEach((request) =>
									request.onSuccess(err)
								);
								failedRequestsQueue = [];
								if (process.browser) {
									signOut();
								}
							})
							.finally(() => {
								isRefreshing = false;
							});
					}

					return new Promise((resolve, reject) => {
						failedRequestsQueue.push({
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
					if (process.browser) {
						signOut();
					} else {
						return Promise.reject(new AuthTokenError());
					}
				}
			}
			return Promise.reject(error);
		}
	);

	return api;
}
