import { createContext, ReactNode, useEffect, useState } from 'react';
import Router from 'next/router';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { setupApiClient } from '../services/api';
import { api } from '../services/apiClient';

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn: (credentials: SignInCredentials) => Promise<void>;
    // signOut: () => void;
    user?: User
    isAuthenticated: boolean;
};

type AuthProviderProps = {
    children: ReactNode;
}

export function singnOut() {
    destroyCookie(undefined, 'nextauth.token')
    destroyCookie(undefined, 'nextauth.refreshToken')
    Router.push('/')
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>();
    const isAuthenticated = !!user;

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies();
        if (token) {
            api.get('/me').then(response => {
                const { email, permissions, roles } = response.data
                setUser({ email, permissions, roles, })
            }).catch(() => {
                singnOut()
            })
        }
    }, [])

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await api.post('sessions', {
                email,
                password
            })

            const { token, refreshToken, permissions, roles } = response.data

            setCookie(null || undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            setCookie(null || undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            })

            setUser({ email, permissions, roles, })

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            Router.push('/dashboard')
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
    );
};

// sessionStorage - Problemas: (Fechar navegador => acaba a sess??o)
// localStorage - Problemas: (Funciona s?? no browser, n??o pega server side)
// cookies - Vantagem: Server side bom
