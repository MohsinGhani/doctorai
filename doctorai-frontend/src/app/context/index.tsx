import { createContext, ReactNode, useState } from "react";

type Dispatch<T> = (action: T) => void;

type StateContextType = {
  user: any;
  baseURL: any;
  setUser: Dispatch<any>;
};

type StateProviderProps = {
  children: ReactNode;
};

export const StateContext = createContext<StateContextType | undefined>(
  undefined
);

export const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  const [user, setUserState] = useState(null);
  const baseURL = "http://localhost:4000";

  const setUser = (user: any) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUserState(user);
  };

  return (
    <StateContext.Provider value={{ user, setUser, baseURL }}>
      {children}
    </StateContext.Provider>
  );
};
