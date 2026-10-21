import React, { createContext, useState, useContext } from 'react';

export const UserContext = createContext<any>(null);
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null); // This will hold { userId, username }
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};