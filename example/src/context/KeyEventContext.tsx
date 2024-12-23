import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { DeviceEventEmitter } from "react-native";

// Define the shape of the context value
interface KeyEventContextType {
  keyEvent: number | null; // keyEvent can be a number or null
}

// Create the KeyEventContext
const KeyEventContext = createContext<KeyEventContextType | undefined>(undefined);

// Create a provider component
export const KeyEventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keyEvent, setKeyEvent] = useState<number | null>(null);

  useEffect(() => {
    const keyDownListener = DeviceEventEmitter.addListener("KeyEventDown", (keyCode: number) => {
      setKeyEvent(keyCode);
    });

    const keyUpListener = DeviceEventEmitter.addListener("KeyEventUp", () => {
      setKeyEvent(null);
    });

    // Cleanup function to remove listeners
    return () => {
      keyDownListener.remove();
      keyUpListener.remove();
    };
  }, []);

  return <KeyEventContext.Provider value={{ keyEvent }}>{children}</KeyEventContext.Provider>;
};

// Create a custom hook to use the KeyEventContext
export const useKeyEvent = (): KeyEventContextType => {
  const context = useContext(KeyEventContext);
  if (context === undefined) {
    throw new Error("useKeyEvent must be used within a KeyEventProvider");
  }
  return context;
};
