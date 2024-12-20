import { useContext, useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  ChannelsContext,
  ConnectionContext,
  ConsoleSettingsContext,
  IncomingVoiceMessageContext,
  LastIncomingTextMessageContext,
  SdkContext,
  SelectedContactContext,
} from '../App';

const MinimalChannelScreen = () => {
  const sdk = useContext(SdkContext); //sdk instance
  const connectionContext = useContext(ConnectionContext);
  const consoleSettings = useContext(ConsoleSettingsContext);
  const channels = useContext(ChannelsContext); //all channels
  const selectedContact = useContext(SelectedContactContext); //selected contact
  const incomingVoiceMessage = useContext(IncomingVoiceMessageContext); //incoming voice message
  const { message: lastIncomingTextMessage } = useContext(
    LastIncomingTextMessageContext
  );

  const [channelDetails, setChannelDetails] = useState<{
    channel: string;
    action: string;
    actionColor: string;
    last: string | null;
    user: string;
  }>({
    channel: 'No Channel', // Default value
    action: 'mic', // Default action
    actionColor: 'white', // Default action color
    last: null,
    user: 'PA-25', // Default user
  });

  // Using useRef to avoid unnecessary re-renders
  const keyCodeRef = useRef<number | null>(null);

  useEffect(() => {
    // Listen for the KeyEvent from native code
    console.log('Adding listener for KeyEvent');
    const subscription = DeviceEventEmitter.addListener('KeyEvent', (code) => {
      console.log(`Key Pressed: ${code}`);

      if (code === 22) {
        handleSendAlert();
      }

      keyCodeRef.current = code; // Store the latest key code in useRef
    });

    return () => subscription.remove(); // Cleanup listener on unmount
  }, []);

  const handleSendAlert = () => {
    console.log(selectedContact); // undefined
    if (selectedContact) {
      sdk.sendAlert(selectedContact, 'Alert from PA-25', 'connected');
    } else {
      console.warn('No contact selected');
    }
  };

  useEffect(() => {
    if (sdk && !connectionContext?.isConnected) {
      sdk.connect({
        network: 'chaverimofnepa',
        username: 'PA-25',
        password: 'MwNLFn4s',
      });
    }
  }, [connectionContext?.isConnected, sdk]);

  useEffect(() => {
    setChannelDetails({
      channel: selectedContact?.name || 'No Channel',
      action: 'mic',
      actionColor: '#ef5e14',
      last: incomingVoiceMessage?.channelUser?.displayName || null,
      user: 'PA-25',
    });
    console.log('selectedContact', selectedContact);
  }, [selectedContact?.name, incomingVoiceMessage]);

  // useEffect(() => {
  //   if (!selectedContact) {
  //     console.warn('selectedContact is undefined');
  //   } else {
  //     console.log('selectedContact', selectedContact);
  //   }
  // }, [selectedContact]);

  return (
    <View style={styles.container}>
      <Text style={styles.channelText}>{channelDetails.channel}</Text>

      <ActionIcon
        name={channelDetails.action}
        color={channelDetails.actionColor}
      />

      {channelDetails.last && (
        <Text style={styles.lastText}>{channelDetails.last}</Text>
      )}
      <Text style={styles.userText}>PA-25</Text>
    </View>
  );
};

export default MinimalChannelScreen;

const ActionIcon = ({ color, name }: { color: string; name: string }) => {
  // Combine styles using StyleSheet.compose
  const iconStyle = [
    styles.action,
    { backgroundColor: color, borderRadius: 100 },
  ];

  return (
    <View style={iconStyle}>
      <Ionicons name={name} size={30} color="white" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191919',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  action: {
    marginVertical: 20,
    borderRadius: 100,
    padding: 20,
  },
  userText: {
    color: 'white',
    fontSize: 20,
    marginTop: 10,
  },
  lastText: {
    color: 'white',
    fontSize: 12,
    fontStyle: 'italic',
    backgroundColor: 'rgb(89, 89, 89)',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 100,
  },
});
