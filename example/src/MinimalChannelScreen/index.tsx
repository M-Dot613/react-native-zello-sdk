import { useContext, useEffect, useState } from "react";
import { DeviceEventEmitter, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ChannelsContext, ConnectionContext, IncomingVoiceMessageContext, OutgoingVoiceMessageContext, SdkContext, SelectedContactContext } from "../App";
import ConnectionModal from "../components/modal/ConnectionModal";
import AlertModal from "../components/modal/AlertModal";

interface ChannelDetails {
  channel: string;
  action: "mic-outline" | "mic" | "mic-off" | "volume-high";
  actionColor: string;
  current: string;
  last: string;
}

const MinimalChannelScreen = () => {
  const sdk = useContext(SdkContext);
  const connectionContext = useContext(ConnectionContext);
  const incomingVoiceMessage = useContext(IncomingVoiceMessageContext);
  const outgoingVoiceMessage = useContext(OutgoingVoiceMessageContext);
  const channels = useContext(ChannelsContext);

  const [channelDetails, setChannelDetails] = useState<ChannelDetails>({
    channel: sdk.selectedContact?.name || "",
    action: "mic-outline",
    actionColor: "#ef5e14",
    current: "",
    last: "",
  });
  const [keyEvent, setKeyEvent] = useState<null | number>(null);
  const [alertInterval, setAlertInterval] = useState<NodeJS.Timeout | null>(null);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const { channel, action, actionColor, current, last } = channelDetails;

  useEffect(() => {
    const keyDownListener = DeviceEventEmitter.addListener("KeyEventDown", (keyCode) => {
      if (keyCode === 295) {
        setKeyEvent(keyCode);
      }
    });

    const keyUpListener = DeviceEventEmitter.addListener("KeyEventUp", (keyCode) => {
      if (keyCode === 295) {
        setKeyEvent(null);
      }
    });

    console.log("SDK", sdk.selectedContact);

    // Cleanup function to remove listeners
    return () => {
      keyDownListener.remove();
      keyUpListener.remove();
      clearAlertInterval(); // Clear interval on component unmount
    };
  }, []);

  useEffect(() => {
    if (!sdk.selectedContact && channels.length > 0) {
      sdk.setSelectedContact(channels[1]);
    }
  }, [connectionContext]);

  useEffect(() => {
    setChannelDetails((prev) => ({
      ...prev,
      channel: sdk.selectedContact?.name || "",
    }));
  }, [sdk.selectedContact]);

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
    if (keyEvent === 295) {
      handleSendAlert();
    } else {
      clearAlertInterval();
    }
  }, [keyEvent]);

  const handleSendAlert = () => {
    let count = 3; // Set the countdown starting value
    // setShowAlertDialog(true); // Show the alert dialog
    setShowAlertDialog(true);

    const interval = setInterval(() => {
      count -= 1;
      console.log(count);
      if (count <= 0) {
        clearAlertInterval();
        clearInterval(interval);
        console.log("Alert Sent");
      }
    }, 1000);

    console.log("Alert Interval", interval);
    setAlertInterval(interval);
  };

  const clearAlertInterval = () => {
    setShowAlertDialog(false); // Hide the alert dialog
    if (alertInterval) {
      clearInterval(alertInterval);
      console.log("Alert Interval Cleared");
    }
  };

  const handleConnect = (username: string, password: string, network: string) => {
    sdk.disconnect();
    setTimeout(() => {
      sdk.connect({ network, username, password });
    }, 100);
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
      <ConnectionModal onConnect={handleConnect} onClose={() => {}} visible={!connectionContext.isConnected && !connectionContext.isConnecting && !sdk.selectedContact} />
     {showAlertDialog && <AlertModal channel={channel} />}
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
