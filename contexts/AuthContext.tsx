import { createContext, ReactNode, useState } from 'react';
import Router from 'next/router';

import { api } from '../services/api';

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
    signOut: () => void;
    user: User;
    isAuthenticated: boolean;
};

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>();
    const isAuthenticated = user ? true : false;

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await api.post('sessions', {
                email,
                password
            })

            const {token, refreshToken, permissions, roles } = response.data

            // sessionStorage - Problemas: (Fechar navegador => acaba a sessão)
            // localStorage - Problemas: (Funciona só no browser, não pega server side)
            // cookies - Vantagem: Server side bom

            setUser({ email, permissions, roles, })

            Router.push('/dashboard')
        } catch (err) {
            console.log(err)
        }
    }


    return (
        <AuthContext.Provider value={{ signIn, user, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};