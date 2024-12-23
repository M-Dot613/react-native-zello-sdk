import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ConnectionContext, IncomingVoiceMessageContext, OutgoingVoiceMessageContext, SdkContext } from "../../App";
import AlertModal from "../../components/modal/AlertModal";

import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import { useNavigationBar } from "../../context/NavigationBarContext";
import { useKeyEvent } from "../../context/KeyEventContext";
interface ChannelDetails {
  channel: string;
  action: "mic-outline" | "mic" | "mic-off" | "volume-high";
  actionColor: string;
  current: string;
  last: string;
}

interface MinimalChannelScreenProps {
  navigation: NavigationProp<any>;
}

const MinimalChannelScreen = ({ navigation }: MinimalChannelScreenProps) => {
  const sdk = useContext(SdkContext);
  const { selectedContact } = useContext(SdkContext);
  const connectionContext = useContext(ConnectionContext);
  const incomingVoiceMessage = useContext(IncomingVoiceMessageContext);
  const outgoingVoiceMessage = useContext(OutgoingVoiceMessageContext);
  const { keyEvent } = useKeyEvent();
  const { resetNav, setNav } = useNavigationBar();

  const [channelDetails, setChannelDetails] = useState<ChannelDetails>({
    // @ts-ignore
    channel: selectedContact?.displayName || selectedContact?.name || "",
    action: "mic-outline",
    actionColor: "#ef5e14",
    current: "",
    last: "",
  });
  const [alertDialog, setAlertDialog] = useState({
    count: 3,
  });
  const [alertInterval, setAlertInterval] = useState<NodeJS.Timeout | null>(null);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const { channel, action, actionColor, current, last } = channelDetails;

  useFocusEffect(
    useCallback(() => {
      resetNav();
      setNav("second", "Scan");
      setNav("third", "Alert");
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (!connectionContext.isConnected && !connectionContext.isConnecting && !selectedContact) {
      navigation.navigate("login");
    }
  }, [connectionContext]);

  useEffect(() => {
    if (!selectedContact && sdk.channels.length > 0) {
      sdk.setSelectedContact(sdk.channels[1]);
    }
  }, [connectionContext]);

  useEffect(() => {
    setChannelDetails((prev) => ({
      ...prev,
      //@ts-ignore
      channel: selectedContact?.displayName || selectedContact?.name || "",
    }));
  }, [selectedContact]);

  useEffect(() => {
    if (outgoingVoiceMessage) {
      setChannelDetails((prev) => ({
        ...prev,
        action: "mic",
      }));
    } else {
      setChannelDetails((prev) => ({
        ...prev,
        action: "mic-outline",
        actionColor: "#ef5e14",
      }));
    }
  }, [outgoingVoiceMessage]);

  useEffect(() => {
    if (incomingVoiceMessage) {
      setChannelDetails((prev) => ({
        ...prev,
        current: incomingVoiceMessage.channelUser?.displayName || "",
        action: "volume-high",
      }));
    } else {
      setChannelDetails((prev) => ({
        ...prev,
        current: "",
        action: "mic-outline",
        last: prev.current,
      }));
    }
  }, [incomingVoiceMessage]);

  useEffect(() => {
    if (keyEvent === null) {
      return;
    } else if (keyEvent === 295) {
      handleSendAlert();
    } else if (keyEvent >= 7 && keyEvent <= 16) {
      navigation.navigate("list-contacts");
    } else if (keyEvent === 294) {
      navigation.navigate("list-scan");
    } else {
      clearAlertInterval();
    }
  }, [keyEvent]);

  const handleSendAlert = () => {
    let count = 3; // Set the countdown starting value
    setAlertDialog({ count: 3 });
    setShowAlertDialog(true);

    const interval = setInterval(() => {
      count -= 1;
      setAlertDialog({ count });
      console.log(count);
      if (count <= 0) {
        sdk.sendAlert(sdk.channels[0], `Emergency at: ${new Date().toLocaleTimeString()}`);
        clearAlertInterval();
        clearInterval(interval);
      }
    }, 1000);

    setAlertInterval(interval);
  };

  const clearAlertInterval = () => {
    setShowAlertDialog(false); // Hide the alert dialog
    if (alertInterval) {
      clearInterval(alertInterval);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.channelText}>{channel}</Text>

        <View style={[styles.action, { backgroundColor: actionColor, borderRadius: 100 }]}>
          <Ionicons name={action} size={30} color="white" />
        </View>

        {current && <Text style={styles.currentText}>{current}</Text>}
        {last && <Text style={styles.lastText}>Last: {last}</Text>}
        <Text style={styles.userText}>PA-25 {keyEvent}</Text>
      </View>
      {showAlertDialog && <AlertModal channel={channel} count={alertDialog.count} />}
      {/* <AlertModal /> */}
    </>
  );
};

export default MinimalChannelScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191919",
    justifyContent: "center",
    alignItems: "center",
  },
  channelText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  action: {
    marginVertical: 20,
    borderRadius: 100,
    padding: 20,
  },
  userText: {
    color: "white",
    fontSize: 20,
    marginTop: 10,
  },
  currentText: {
    color: "white",
    fontSize: 12,
    backgroundColor: "rgb(89, 89, 89)",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 100,
  },
  lastText: {
    color: "white",
    fontSize: 12,
    fontStyle: "italic",
    backgroundColor: "rgb(89, 89, 89)",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 100,
  },
});
