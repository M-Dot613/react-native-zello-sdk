import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the type for the context value
interface NavigationBarContextType {
  items: {
    first: string;
    second: string;
    third: string;
  };
  setNav: (key: "first" | "second" | "third", value: string) => void;
  resetNav: () => void;
}

// Create Context with a default value of `undefined` to enforce proper usage
const NavigationBarContext = createContext<NavigationBarContextType | undefined>(undefined);

// Define the props for the provider
interface NavigationBarProviderProps {
  children: ReactNode;
}

// Context Provider Component
export const NavigationBarProvider: React.FC<NavigationBarProviderProps> = ({ children }) => {
  const [items, setNavs] = useState<{ first: string; second: string; third: string }>({
    first: " ",
    second: " ",
    third: "Third",
  });

  // Generic setter function to update any of the items
  const setNav = (key: "first" | "second" | "third", value: string) => {
    setNavs((prevItems) => ({
      ...prevItems,
      [key]: value,
    }));
  };

  const resetNav = () => {
    setNavs({
      first: " ",
      second: " ",
      third: " ",
    });
  };

  return (
    <NavigationBarContext.Provider value={{ items, setNav, resetNav }}>
      {children}
    </NavigationBarContext.Provider>
  );
};

// Hook for easier access to the context
export const useNavigationBar = (): NavigationBarContextType => {
  const context = useContext(NavigationBarContext);
  if (!context) {
    throw new Error("useNavigationBar must be used within a NavigationBarProvider");
  }
  return context;
};
