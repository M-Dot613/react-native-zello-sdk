import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ZelloConnectionError, ZelloConnectionState, ZelloEvent } from "@zelloptt/react-native-zello-sdk";
import { SdkContext } from "../App";

// Create the ConnectionContextContext
export const ConnectionContext = createContext({
  isConnected: false,
  isConnecting: false,
  isDisconnected: false,
});

// Create a provider component
export const ConnectionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sdk = useContext(SdkContext);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  useEffect(() => {
    // Add event listener for contact list updates
    sdk.addListener(ZelloEvent.CONNECT_FAILED, (_state: ZelloConnectionState, error: ZelloConnectionError) => {
      console.log("Connect failed", error);
      setIsConnecting(false);
      setIsConnected(false);
      setIsDisconnected(true);
    });
    sdk.addListener(ZelloEvent.CONNECT_STARTED, () => {
      setIsConnecting(true);
      setIsConnected(false);
      setIsDisconnected(false);
    });
    sdk.addListener(ZelloEvent.CONNECT_SUCCEEDED, () => {
      setIsConnecting(false);
      setIsConnected(true);
      setIsDisconnected(false);
    });
    sdk.addListener(ZelloEvent.DISCONNECTED, () => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsDisconnected(true);
    });

    // Cleanup listener on unmount
    return () => {
      sdk.removeAllListeners(ZelloEvent.CONNECT_FAILED);
      sdk.removeAllListeners(ZelloEvent.CONNECT_STARTED);
      sdk.removeAllListeners(ZelloEvent.CONNECT_SUCCEEDED);
      sdk.removeAllListeners(ZelloEvent.DISCONNECTED);
    };
  }, [sdk]);

  return <ConnectionContext.Provider value={{ isConnected, isConnecting, isDisconnected }}>{children}</ConnectionContext.Provider>;
};

// Create a custom hook to consume the context
export const useConnectionContext = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnectionContext must be used within a ConnectionContextProvider");
  }
  return context;
};
