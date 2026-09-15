import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [profilePic, setProfilePic] = useState(null);


  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, profilePic, setProfilePic }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);