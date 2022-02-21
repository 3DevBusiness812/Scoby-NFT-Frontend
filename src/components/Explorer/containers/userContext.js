import React, {createContext, useState} from 'react';

export const DefaultUserContext = {
  user: {id:null},
  setUser: () => {},
};

export const UserContext = createContext(DefaultUserContext);

export default function UserProvider({children}) {
  const [user, setUser] = useState(DefaultUserContext.user);
  return (
    <UserContext.Provider value={{user, setUser}}>
      {children}
    </UserContext.Provider>
  );
}