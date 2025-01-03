import React, { useCallback, useContext, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ChannelsContext,
  ConsoleSettingsContext,
  EmergencyContext,
  HistoryContext,
  IncomingVoiceMessageContext,
  LastIncomingAlertMessageContext,
  LastIncomingImageMessageContext,
  LastIncomingLocationMessageContext,
  LastIncomingTextMessageContext,
  SdkContext,
  SelectedContactContext,
} from '../../App';
import TalkButton from '../../shared/TalkButton';
import ConnectModal from '../../shared/ConnectModal';
import {
  ZelloAccountStatus,
  ZelloChannel,
  ZelloChannelConnectionStatus,
  ZelloDispatchChannel,
  ZelloDispatchCallStatus,
  ZelloHistoryMessage,
} from '@zelloptt/react-native-zello-sdk';
import StatusDialog from '../../shared/StatusDialog';
import useNavigationOptions from '../../shared/hooks/useNavigationOptions';
import ContextMenuButton from '../../shared/ContextMenuButton';
import IncomingImageDialog from '../../shared/IncomingImageDialog';
import IncomingAlertDialog from '../../shared/IncomingAlertDialog';
import IncomingLocationDialog from '../../shared/IncomingLocationDialog';
import IncomingTextDialog from '../../shared/IncomingTextDialog';
import OutgoingTextDialog from '../../shared/OutgoingTextDialog';
import OutgoingAlertDialog from '../../shared/OutgoingAlertDialog';
import HistoryDialog from '../../shared/HistoryDialog';
import { isSameContact } from '@zelloptt/react-native-zello-sdk';

interface ChannelViewProps {
  channel: ZelloChannel;
  isSelectedContact: boolean;
  openSendTextDialog: (contact: ZelloChannel) => void;
  openSendAlertDialog: (contact: ZelloChannel) => void;
  openHistoryDialog: (contact: ZelloChannel) => void;
}

const ChannelView = React.memo(
  ({
    channel,
    isSelectedContact,
    openSendTextDialog,
    openSendAlertDialog,
    openHistoryDialog,
  }: ChannelViewProps) => {
    const sdk = useContext(SdkContext);
    const consoleSettings = useContext(ConsoleSettingsContext);
    const incomingVoiceMessage = useContext(IncomingVoiceMessageContext);
    const emergency = useContext(EmergencyContext);

    const onSwitchChange = useCallback(() => {
      if (channel.connectionStatus === ZelloChannelConnectionStatus.Connected) {
        sdk.disconnectChannel(channel);
      } else {
        sdk.connectChannel(channel);
      }
    }, [sdk, channel]);

    const isReceiving = useCallback(() => {
      return (
        incomingVoiceMessage &&
        isSameContact(incomingVoiceMessage?.contact, channel)
      );
    }, [incomingVoiceMessage, channel]);

    const isEmergencyChannel = useCallback(() => {
      return (
        sdk.emergencyChannel && isSameContact(sdk.emergencyChannel, channel)
      );
    }, [sdk.emergencyChannel, channel]);

    const getIncomingEmergency = useCallback(() => {
      return emergency.incomingEmergencies.find((incomingEmergency) =>
        isSameContact(incomingEmergency.channel, channel)
      );
    }, [emergency, channel]);

    const isOutgoingEmergency = useCallback(() => {
      return (
        emergency.outgoingEmergency &&
        isSameContact(emergency.outgoingEmergency.channel, channel)
      );
    }, [emergency, channel]);

    const getCall = useCallback(() => {
      if (!(channel instanceof ZelloDispatchChannel)) return null;
      return channel.currentCall;
    }, [channel]);

    const canEndCall = useCallback(() => {
      if (!(channel instanceof ZelloDispatchChannel)) return false;
      return (
        consoleSettings?.allowNonDispatchersToEndCalls &&
        channel.currentCall?.status === ZelloDispatchCallStatus.Active
      );
    }, [channel, consoleSettings]);

    const endCall = useCallback(() => {
      if (channel instanceof ZelloDispatchChannel) {
        sdk.endDispatchCall(channel);
      }
    }, [channel, sdk]);

    const getDispatchCallStatus = useCallback(() => {
      if (!(channel instanceof ZelloDispatchChannel)) return null;
      return channel.currentCall?.status === ZelloDispatchCallStatus.Active
        ? `${channel.currentCall?.status} with ${channel.currentCall?.dispatcher}`
        : channel.currentCall?.status;
    }, [channel]);

    const isConnected =
      channel.connectionStatus === ZelloChannelConnectionStatus.Connected;

    return (
      <TouchableOpacity
        style={styles.channelContainer}
        onPress={() => sdk.setSelectedContact(channel)}
      >
        <View style={styles.channelNameContainer}>
          <Text
            style={[
              styles.channelName,
              isSelectedContact && styles.selectedContact,
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {channel.name}
          </Text>
          <Text>
            {isConnected
              ? `Users Online: ${channel.usersOnline}`
              : channel.connectionStatus ===
                ZelloChannelConnectionStatus.Connecting
              ? 'Connecting'
              : 'Disconnected'}
          </Text>
          {isReceiving() && (
            <Text>{`Talking: ${incomingVoiceMessage?.channelUser?.displayName}`}</Text>
          )}
          {getIncomingEmergency() && (
            <Text>{`ACTIVE INCOMING EMERGENCY: ${
              getIncomingEmergency()?.channelUser.displayName
            }`}</Text>
          )}
          {isOutgoingEmergency() && <Text>ACTIVE OUTGOING EMERGENCY</Text>}
          {getCall() && (
            <Text>{`Call Status: ${getDispatchCallStatus()}`}</Text>
          )}
        </View>
        <View style={styles.trailingButtons}>
          <ContextMenuButton
            contact={channel}
            showSendImageOption={
              isConnected && consoleSettings?.allowImageMessages
            }
            showSendAlertOption={
              isConnected &&
              consoleSettings?.allowAlertMessages &&
              channel.options.allowAlertMessages
            }
            showSendTextOption={
              isConnected &&
              consoleSettings?.allowTextMessages &&
              channel.options.allowTextMessages
            }
            showSendLocationOption={
              isConnected &&
              consoleSettings?.allowLocationMessages &&
              channel.options.allowLocationMessages
            }
            showEmergencyOption={isEmergencyChannel()}
            isInOutgoingEmergency={isOutgoingEmergency()}
            showEndCallOption={canEndCall()}
            onSendTextSelected={() => openSendTextDialog(channel)}
            onSendAlertSelected={() => openSendAlertDialog(channel)}
            onShowHistorySelected={() => openHistoryDialog(channel)}
            onEndCallSelected={endCall}
          />
          <Switch
            value={isConnected}
            onValueChange={onSwitchChange}
            style={styles.connectionSwitch}
          />
          <TalkButton contact={channel} disabled={!isConnected} />
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.channel === nextProps.channel &&
    prevProps.isSelectedContact === nextProps.isSelectedContact
);

const ChannelsScreen = ({ navigation }: { navigation: any }) => {
  const sdk = useContext(SdkContext);
  const channels = useContext(ChannelsContext);
  const selectedContact = useContext(SelectedContactContext);
  const { message: lastIncomingImageMessage } = useContext(
    LastIncomingImageMessageContext
  );
  const { message: lastIncomingAlertMessage } = useContext(
    LastIncomingAlertMessageContext
  );
  const { message: lastIncomingTextMessage } = useContext(
    LastIncomingTextMessageContext
  );
  const { message: lastIncomingLocationMessage } = useContext(
    LastIncomingLocationMessageContext
  );
  const { setHistory } = useContext(HistoryContext);

  const [isConnectDialogVisible, setIsConnectDialogVisible] = useState(false);
  const [isStatusDialogVisible, setIsStatusDialogVisible] = useState(false);
  const [sendTextDialogVisible, setSendTextDialogVisible] = useState({
    visible: false,
    channel: undefined as ZelloChannel | undefined,
  });
  const [sendAlertDialogVisible, setSendAlertDialogVisible] = useState({
    visible: false,
    channel: undefined as ZelloChannel | undefined,
  });
  const [historyDialogVisible, setHistoryDialogVisible] = useState(false);

  useNavigationOptions(
    navigation,
    setIsConnectDialogVisible,
    setIsStatusDialogVisible
  );

  const renderItem = useCallback(
    ({ item }: { item: ZelloChannel }) => (
      <ChannelView
        channel={item}
        isSelectedContact={
          selectedContact !== undefined && isSameContact(selectedContact, item)
        }
        openSendTextDialog={(contact: ZelloChannel) =>
          setSendTextDialogVisible({ visible: true, channel: contact })
        }
        openSendAlertDialog={(contact: ZelloChannel) =>
          setSendAlertDialogVisible({ visible: true, channel: contact })
        }
        openHistoryDialog={(contact: ZelloChannel) => {
          sdk.getHistory(contact).then((messages: ZelloHistoryMessage[]) => {
            setHistory?.(contact, messages);
            setHistoryDialogVisible(true);
          });
        }}
      />
    ),
    [selectedContact, sdk, setHistory]
  );

  const keyExtractor = useCallback((item: ZelloChannel) => item.name, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={channels}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
      {isConnectDialogVisible && (
        <ConnectModal
          onConnect={(username: string, password: string, network: string) =>
            sdk.connect({ network, username, password })
          }
          onClose={() => setIsConnectDialogVisible(false)}
        />
      )}
      {isStatusDialogVisible && (
        <StatusDialog
          onDismiss={() => setIsStatusDialogVisible(false)}
          onSelectStatus={(status: ZelloAccountStatus) => {
            sdk.setAccountStatus(status);
            setIsStatusDialogVisible(false);
          }}
        />
      )}
      {lastIncomingImageMessage && (
        <IncomingImageDialog message={lastIncomingImageMessage} />
      )}
      {lastIncomingAlertMessage && (
        <IncomingAlertDialog message={lastIncomingAlertMessage} />
      )}
      {lastIncomingTextMessage && (
        <IncomingTextDialog message={lastIncomingTextMessage} />
      )}
      {lastIncomingLocationMessage && (
        <IncomingLocationDialog message={lastIncomingLocationMessage} />
      )}
      {sendTextDialogVisible.visible && sendTextDialogVisible.channel && (
        <OutgoingTextDialog
          contact={sendTextDialogVisible.channel}
          onClose={() =>
            setSendTextDialogVisible({ visible: false, channel: undefined })
          }
        />
      )}
      {sendAlertDialogVisible.visible && sendAlertDialogVisible.channel && (
        <OutgoingAlertDialog
          contact={sendAlertDialogVisible.channel}
          onClose={() =>
            setSendAlertDialogVisible({ visible: false, channel: undefined })
          }
        />
      )}
      {historyDialogVisible && (
        <HistoryDialog onClose={() => setHistoryDialogVisible(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  channelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  channelNameContainer: {
    flex: 1,
  },
  channelName: {
    flex: 1,
    flexWrap: 'wrap',
    width: '100%',
  },
  selectedContact: {
    fontWeight: 'bold',
  },
  trailingButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  connectionSwitch: {
    marginHorizontal: 8,
  },
});

export default ChannelsScreen;
