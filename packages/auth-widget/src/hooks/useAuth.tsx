import React from "react";
import { AarcAuthWidgetConfig } from "../components/types";

const AuthContext = React.createContext({});

const AuthProvider = ({ children, config }: { children: React.ReactNode, config: AarcAuthWidgetConfig }) => {

    return (
        <AuthContext.Provider value={config}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;