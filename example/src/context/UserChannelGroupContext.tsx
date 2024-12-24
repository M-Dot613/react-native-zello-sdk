import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ZelloUser, ZelloChannel, ZelloGroupConversation, ZelloEvent } from "@zelloptt/react-native-zello-sdk";
import { SdkContext } from "../App";

// Create the UserChannelGroupContext
export const UsersContext = createContext<ZelloUser[]>([]);
export const ChannelsContext = createContext<ZelloChannel[]>([]);
export const GroupConversationsContext = createContext<ZelloGroupConversation[]>([]);

// Create a provider component
export const UserChannelGroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sdk = useContext(SdkContext);
  const [users, setUsers] = useState<ZelloUser[]>(sdk.users || []);
  const [channels, setChannels] = useState<ZelloChannel[]>(sdk.channels || []);
  const [groupConversations, setGroupConversations] = useState<ZelloGroupConversation[]>(sdk.groupConversations || []);

  useEffect(() => {
    const updateData = () => {
      setUsers(sdk.users);
      setChannels(sdk.channels);
      setGroupConversations(sdk.groupConversations);
    };

    // Add event listener for contact list updates
    sdk.addListener(ZelloEvent.CONTACT_LIST_UPDATED, updateData);

    // Cleanup listener on unmount
    return () => {
      sdk.removeAllListeners(ZelloEvent.CONTACT_LIST_UPDATED);
    };
  }, [sdk]);

  return (
    <UsersContext.Provider value={users}>
      <ChannelsContext.Provider value={channels}>
        <GroupConversationsContext.Provider value={groupConversations}>{children}</GroupConversationsContext.Provider>
      </ChannelsContext.Provider>
    </UsersContext.Provider>
  );
};

// Create a custom hook to consume the context
export const useUserChannelGroup = () => {
  const users = useContext(UsersContext);
  const channels = useContext(ChannelsContext);
  const groupConversations = useContext(GroupConversationsContext);

  if (!users || !channels || !groupConversations) {
    throw new Error("useUserChannelGroupProvider must be used within a UserChannelGroupProvider");
  }

  return { users, channels, groupConversations };
};
