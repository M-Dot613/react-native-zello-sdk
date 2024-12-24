import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the type for the context value
interface NavigationBarContextType {
  items: {
    first: string;
    second: string;
    third: string;
  };
  setNavigation: (first: string, second: string, third: string) => void;
  resetNavigation: () => void;
  setNavigationItem: (index: 1 | 2 | 3, value: string) => void;
}

// Define the props for the provider
interface NavigationBarProviderProps {
  children: ReactNode;
}

// Create Context with a default value of `undefined` to enforce proper usage
const NavigationBarContext = createContext<NavigationBarContextType | undefined>(undefined);

// Context Provider Component
export const NavigationBarProvider: React.FC<NavigationBarProviderProps> = ({ children }) => {
  const [navItems, setNavItems] = useState<NavigationBarContextType["items"]>({
    first: "",
    second: "",
    third: "",
  });

  // Set all three items
  const setNavigation = (first: string, second: string, third: string) => {
    setNavItems({
      first,
      second,
      third,
    });
  };

  // Reset all items
  const resetNavItems = () => {
    setNavItems({
      first: "",
      second: "",
      third: "",
    });
  };

  // Set a specific item based on its index
  const setNavigationItem = (index: 1 | 2 | 3, value: string) => {
    setNavItems((prevState) => {
      const newItems = { ...prevState };
      if (index === 1) {
        newItems.first = value;
      } else if (index === 2) {
        newItems.second = value;
      } else if (index === 3) {
        newItems.third = value;
      }
      return newItems;
    });
  };

  return (
    <NavigationBarContext.Provider value={{ items: navItems, setNavigation, resetNavigation: resetNavItems, setNavigationItem }}>
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
