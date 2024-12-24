import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Sound from "react-native-sound";

import { NavigationProp, useFocusEffect, useIsFocused } from "@react-navigation/native";
import { ZelloContactType } from "@zelloptt/react-native-zello-sdk";

import {  IncomingVoiceMessageContext, LastIncomingAlertMessageContext, OutgoingVoiceMessageContext, SdkContext } from "../../App";
import { useNavigationBar } from "../../context/NavigationBarContext";
import { useKeyEvent } from "../../context/KeyEventContext";
import AlertModal from "../../components/modal/AlertModal";
import { useUserChannelGroup } from "../../context/UserChannelGroupContext";
import { useConnectionContext } from "../../context/ConnectionContext";

interface ChannelDetails {
  channel: string;
  action: "mic-outline" | "mic" | "mic-off" | "volume-high";
  actionColor: string;
  current: string;
  last: string;
  alert: string;
  type: ZelloContactType | "";
}
interface MinimalChannelScreenProps {
  navigation: NavigationProp<any>;
}

interface AlertDialog {
  count: number;
  show: boolean;
}

const MinimalChannelScreen = ({ navigation }: MinimalChannelScreenProps) => {
  // Contexts and hooks
  const { selectedContact, setSelectedContact, sendAlert } = useContext(SdkContext);
  const connectionContext = useConnectionContext();
  const incomingVoiceMessage = useContext(IncomingVoiceMessageContext);
  const outgoingVoiceMessage = useContext(OutgoingVoiceMessageContext);
  const lastIncomingAlertMessage = useContext(LastIncomingAlertMessageContext);
  const { keyEvent } = useKeyEvent();
  const { channels } = useUserChannelGroup();
  const { setNavigation, setNavigationItem } = useNavigationBar();

  // States
  const [{ channel, action, actionColor, current, last, alert, type }, setChannelDetails] = useState<ChannelDetails>({
    // @ts-ignore
    channel: selectedContact?.displayName || selectedContact?.name || "",
    action: "mic-outline",
    actionColor: "#ef5e14",
    current: "",
    last: "",
    alert: "",
    type: selectedContact?.type || "",
  });
  const [alertDialog, setAlertDialog] = useState<AlertDialog>({
    count: 3,
    show: false,
  });
  // Todo: get rid?
  const [alertInterval, setAlertInterval] = useState<NodeJS.Timeout | null>(null);
  const [playing, setPlaying] = useState(false);

  // Other variables
  let sound: Sound | null = null;

  // Effects
  useFocusEffect(
    useCallback(() => {
      setNavigation("", "Scan", "Alert");
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (!connectionContext.isConnected && !connectionContext.isConnecting && !selectedContact) {
      navigation.navigate("login");
    }

    selectFallbackChannel();
  }, [connectionContext]);

  useEffect(() => {
    updateChannelDetails();
    selectFallbackChannel();
  }, [selectedContact, incomingVoiceMessage, outgoingVoiceMessage, lastIncomingAlertMessage]);

  useEffect(() => {
    handleKeyEvent();
  }, [keyEvent]);

  const selectFallbackChannel = () => {
    if (!selectedContact && channels.length > 0) {
      setSelectedContact(channels[1]);
    }
  };

  const updateChannelDetails = () => {
    setChannelDetails((prev) => ({
      ...prev,
      //@ts-ignore
      channel: selectedContact?.displayName || selectedContact?.name || "",
      //@ts-ignore
      alert: selectedContact?.connectionStatus === "disconnected" ? "Disconnected" : "",
      action: outgoingVoiceMessage ? "mic" : "mic-outline",
      actionColor: outgoingVoiceMessage ? "#ef5e14" : "#ef5e14",
      current: incomingVoiceMessage ? incomingVoiceMessage.channelUser?.displayName || "" : "",
      last: incomingVoiceMessage ? prev.current : prev.last,
      type: selectedContact?.type || "",
    }));

    if (lastIncomingAlertMessage.message) {
      handlePlaySound();
      setChannelDetails((prev) => ({
        ...prev,
        alert: "Emergency",
      }));
      setTimeout(() => {
        lastIncomingAlertMessage.clearMessage?.();
      }, 5000);
    }
  };

  const handleKeyEvent = () => {
    if (keyEvent === null) {
      clearAlertInterval();
      return;
    } else if (keyEvent === 295) {
      handleSendAlert();
    } else if (keyEvent >= 7 && keyEvent <= 16) {
      navigation.navigate("list-contacts");
    } else if (keyEvent === 294) {
      navigation.navigate("list-scan");
    } else {
      console.log(keyEvent, "not handled");
    }
  };

  const handleSendAlert = () => {
    let count = 3;
    setAlertDialog({ count: 3, show: true });

    const interval = setInterval(() => {
      count -= 1;
      setAlertDialog((prev) => ({ ...prev, count }));
      if (count <= 0) {
        sendAlert(channels[0], `Emergency at: ${new Date().toLocaleTimeString()}`);
        clearAlertInterval();
        clearInterval(interval);
      }
    }, 1000);

    setAlertInterval(interval);
  };

  const clearAlertInterval = () => {
    setAlertDialog((prev) => ({ ...prev, show: false }));
    if (alertInterval) {
      clearInterval(alertInterval);
    }
  };

  const handlePlaySound = () => {
    if (playing) {
      stopSound();
      // Load the sound file (replace 'your-sound-file.mp3' with the actual file)
      sound = new Sound("tone.mp3", Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log("Failed to load sound", error);
          return;
        }

        // Play the sound
        sound?.play((success) => {
          if (success) {
            console.log("Successfully finished playing");
          } else {
            console.log("Playback failed due to audio decoding errors");
          }
          sound?.release(); // Release the sound resource when done
        });
      });
      setPlaying(true);
    }
  };

  const stopSound = () => {
    if (sound) {
      sound.stop(() => {
        console.log("Sound stopped");
        setPlaying(false);
      });
    }
  };

  return (
    <>
      <View style={[styles.container, type === ZelloContactType.User && { borderColor: "rgb(216, 168, 56)", borderWidth: 5 }]}>
        <Text style={styles.channelText}>{channel}</Text>

        <View style={[styles.action, { backgroundColor: actionColor, borderRadius: 100 }]}>
          <Ionicons name={action} size={30} color="white" />
        </View>

        {current && <Text style={styles.currentText}>{current}</Text>}
        {last && !alert && <Text style={styles.lastText}>Last: {last}</Text>}
        {alert && !current && <Text style={styles.alertText}>{alert}</Text>}
        <Text style={styles.userText}>PA-25 {keyEvent}</Text>
      </View>
      {alertDialog.show && <AlertModal channel={channel} count={alertDialog.count} />}
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
  alertText: {
    color: "white",
    fontSize: 12,
    fontStyle: "italic",
    backgroundColor: "rgb(180, 23, 23)",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 100,
  },
});
