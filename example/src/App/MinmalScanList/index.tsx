import React, { useCallback, useContext, useEffect, useState } from "react";
import { Text, StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { SdkContext } from "../../App";
import { useKeyEvent } from "../../context/KeyEventContext";

import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import { useNavigationBar } from "../../context/NavigationBarContext";
import { ZelloChannel, ZelloChannelConnectionStatus } from "../../../../lib/typescript/module/src/types";

interface MinimalScanListProps {
  navigation: NavigationProp<any>;
}

interface MinimalScanListItemProps {
  item: ZelloChannel;
  index: number;
  focused: number;
  onPress: (channel: ZelloChannel) => void;
}

interface ScanIconProps {
  status: ZelloChannelConnectionStatus;
  noDisconnect: boolean;
}

export default function MinimalScanList({ navigation }: MinimalScanListProps) {
  const { channels, disconnectChannel, connectChannel } = useContext(SdkContext);
  const { resetNav, setNav } = useNavigationBar();
  const [focused, setFocused] = useState(0);
  const { keyEvent } = useKeyEvent();

  useFocusEffect(
    useCallback(() => {
      resetNav();
      setNav("second", "");
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (!keyEvent || keyEvent === 66 || channels.length === 0) return;

    if (keyEvent === 20) {
      setFocused((prev) => (prev + 1) % channels.length);
    } else if (keyEvent === 19) {
      setFocused((prev) => (prev - 1 + channels.length) % channels.length);
    } else {
      console.log(keyEvent, "not handled");
    }
  }, [keyEvent, channels.length]);

  const handlePress = (channel: ZelloChannel) => {
    const {
      connectionStatus,
      options: { noDisconnect },
    } = channel;
    if (noDisconnect) return;
    if (connectionStatus === "connected") {
      disconnectChannel(channel);
    } else if (connectionStatus === "disconnected") {
      connectChannel(channel);
    } else {
      console.error("Unknown connection status", connectionStatus);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Scan List</Text>
      <FlatList
        data={channels}
        renderItem={({ item, index }) => <MinimalScanListItem item={item} index={index} focused={focused} onPress={handlePress} />}
        keyExtractor={(item) => item.name}
        style={styles.list}
      />
    </View>
  );
}

const MinimalScanListItem = React.memo(({ item, index, focused, onPress }: MinimalScanListItemProps) => {
  return (
    <TouchableOpacity style={[styles.item, index === focused && styles.selectedItem]} onPress={() => onPress(item)} hasTVPreferredFocus={index === focused}>
      <Text style={styles.itemText}>{item.name}</Text>
      <ScanIcon status={item.connectionStatus} noDisconnect={item.options.noDisconnect} />
    </TouchableOpacity>
  );
});

function ScanIcon({ status, noDisconnect }: ScanIconProps) {
  let iconName = "help-circle-outline";
  let iconColor = "#c1c1c1";

  switch (status) {
    case "connected":
      iconName = "radio-button-on";
      iconColor = "#00ff00";
      break;
    case "disconnected":
      iconName = "radio-button-off";
      iconColor = "#00ff00";
      break;
    default:
      console.warn("Unknown connection status:", status);
  }

  if (noDisconnect) {
    iconColor = "#c1c1c1";
  }
  return <Ionicons name={iconName} size={30} color={iconColor} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191919",
  },
  header: {
    color: "#fff",
    textAlign: "center",
    padding: 10,
    fontSize: 20,
  },
  list: {
    paddingHorizontal: 10,
  },
  item: {
    backgroundColor: "#595959",
    marginBottom: 3,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    borderColor: "#595959",
    borderWidth: 2,
  },
  itemText: {
    color: "white",
    fontSize: 18,
    flex: 1,
  },
  selectedItem: {
    borderColor: "#ef5e14",
    borderWidth: 2,
  },
});
