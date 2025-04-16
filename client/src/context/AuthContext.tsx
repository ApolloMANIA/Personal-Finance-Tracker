import { createContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    token:string|null;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

interface AuthAction {
    type: 'LOGIN_START' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'REGISTER_SUCCESS' | 'LOGOUT';
    payload?: User | string;
}

const initialState: AuthState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null,
    loading: false,
    error: null,
};

export const AuthContext = createContext<{
    user: User | null;
    loading: boolean;
    error: string | null;
    dispatch: Dispatch<AuthAction>;
}>({...initialState, dispatch:()=>null,});

const AuthReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_START':
            return { user: null, loading: true, error: null };
        case 'LOGIN_SUCCESS':
            return { user:{...action.payload as User, token:(action.payload as any).token },
            loading:false,
            error:null
        
        };
        case 'LOGIN_FAILURE':
            return { user: null, loading: false, error: action.payload as string };
        case 'REGISTER_SUCCESS':
        case 'LOGOUT':
            return { user: null, loading: false, error: null };
        default:
            return state;
    }
};

interface AuthProviderProps {
    children: ReactNode;
}


export const AuthContextProvider = ({ children }: AuthProviderProps) => {
    const [state, dispatch] = useReducer(AuthReducer, initialState);

    useEffect(() => {
        if (state.user) {
            localStorage.setItem("user", JSON.stringify({ id: state.user.id, token: state.user.token }));
        } else {
            localStorage.removeItem("user");
        }
    }, [state.user]);

    return (
        <AuthContext.Provider value={{
            user: state.user,
            loading: state.loading,
            error: state.error,
            dispatch,
        }}>
            {children}
        </AuthContext.Provider>
    );
};