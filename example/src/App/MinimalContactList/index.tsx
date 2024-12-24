import React, { useCallback, useContext, useEffect, useState } from "react";
import { Text, StyleSheet, View, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { SdkContext } from "../../App";
import { useKeyEvent } from "../../context/KeyEventContext";

import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import { useNavigationBar } from "../../context/NavigationBarContext";

export default function MinimalContactList({ navigation }: { navigation: NavigationProp<any> }) {
  const sdk = useContext(SdkContext);
  const { users, setSelectedContact } = useContext(SdkContext);
  const { keyEvent } = useKeyEvent();
  const { setNavigation } = useNavigationBar();

  const [showOffline, setShowOffline] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchText, setSearchText] = useState<string | null>(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      setNavigation("", "View All", "Back");
      return () => {
      };
    }, [])
  );
  useEffect(() => {
    if (keyEvent === null) return;

    if (keyEvent >= 7 && keyEvent <= 16) {
      updateSearchText(keyEvent);
    } else if (keyEvent === 21) {
      removeLastCharacterFromSearch();
    } else if (keyEvent === 20) {
      moveSelectionDown();
    } else if (keyEvent === 19) {
      moveSelectionUp();
    } else if (keyEvent === 66) {
      handleEnterKey();
    } else if (keyEvent === 294) {
      setShowOffline((prev) => !prev);
    } else {
      console.log(keyEvent, "not handled");
    }
  }, [keyEvent]);

  useEffect(() => {
    updateFilteredUsers();
  }, [users, showOffline, searchText]);

  const updateSearchText = (key: number) => {
    const keyEventString = (key - 7).toString();
    setSearchText((prev) => (prev ? prev + keyEventString : keyEventString));
  };

  const removeLastCharacterFromSearch = () => {
    setSearchText((prev) => (prev ? prev.slice(0, -1) : null));
  };

  const moveSelectionDown = () => {
    setSelectedUserIndex((prevIndex) => {
      if (filteredUsers.length === 0) return null;
      if (prevIndex === null || prevIndex >= filteredUsers.length - 1) {
        return 0; // Wrap around to the top
      }
      return prevIndex + 1;
    });
  };

  const moveSelectionUp = () => {
    setSelectedUserIndex((prevIndex) => {
      if (filteredUsers.length === 0) return null;
      if (prevIndex === null || prevIndex <= 0) {
        return filteredUsers.length - 1; // Wrap around to the bottom
      }
      return prevIndex - 1;
    });
  };

  const handleEnterKey = () => {
    if (selectedUserIndex !== null) {
      setSelectedContact(filteredUsers[selectedUserIndex]);
      navigation.navigate("index");
    }
  };

  const updateFilteredUsers = () => {
    const newFilteredUsers = users
      .filter((user) => showOffline || user.status === "available")
      .filter((user) => (searchText ? user.displayName.toLowerCase().includes(searchText.toLowerCase()) : true));
    setFilteredUsers(newFilteredUsers);
    setSelectedUserIndex(null); // Reset the selection
  };

  return (
    <View style={styles.container}>
      <SearchBar searchText={searchText} />
      <UserList users={filteredUsers} selectedUserIndex={selectedUserIndex} showOffline={showOffline} />
    </View>
  );
}

/**
 * SearchBar Component
 */
const SearchBar = ({ searchText }: { searchText: string | null }) => (
  <View style={styles.search}>
    <Text style={styles.searchText}>{searchText}</Text>
  </View>
);

/**
 * UserList Component
 */
const UserList = ({
  users,
  selectedUserIndex,
}: {
  users: Array<{ displayName: string; status: string; name: string }>;
  selectedUserIndex: number | null;
  showOffline: boolean;
}) => (
  <ScrollView style={styles.list}>
    {users.map((user, index) => {
      const isSelected = index === selectedUserIndex;
      return <UserItem key={user.name} user={user} isSelected={isSelected} />;
    })}
  </ScrollView>
);

/**
 * UserItem Component
 */
const UserItem = ({ user, isSelected }: { user: { displayName: string; status: string }; isSelected: boolean }) => {
  const iconConfig = getUserStatusIcon(user.status);
  return (
    <View style={[styles.item, isSelected ? styles.selectedItem : null]}>
      <Text style={styles.itemText}>{user.displayName}</Text>
      {iconConfig && <Ionicons name={iconConfig.iconName} size={30} color={iconConfig.iconColor} />}
    </View>
  );
};

/**
 * Get status icon configuration based on user status.
 */
const getUserStatusIcon = (status: string) => {
  if (status === "standby") {
    return { iconName: "close-circle-outline", iconColor: "#ef5e14" };
  } else if (status === "available") {
    return { iconName: "checkmark-circle-outline", iconColor: "#00ff00" };
  }
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191919",
  },
  search: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 3,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#ef5e14",
  },
  searchText: {
    color: "#000",
    fontSize: 25,
    textAlign: "center",
  },
  list: {
    marginHorizontal: 10,
  },
  item: {
    backgroundColor: "#595959",
    padding: 10,
    borderRadius: 5,
    borderColor: "#595959",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    borderWidth: 2,
  },
  itemText: {
    paddingLeft: 2,
    color: "white",
    fontSize: 20,
    flex: 1,
  },
  selectedItem: {
    borderColor: "#ef5e14",
    borderWidth: 2,
  },
});
