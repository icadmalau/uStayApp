import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextProps {
    user: any;
    login: (userData: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser ] = useState<any>(null);

    useEffect(() => {
        const storedUser  = localStorage.getItem('user');
        if (storedUser ) {
            setUser (JSON.parse(storedUser ));
        }
    }, []);

    const login = (userData: any) => {
        setUser (userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser (null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};