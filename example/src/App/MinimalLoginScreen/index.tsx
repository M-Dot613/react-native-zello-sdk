import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import { SdkContext } from "../../App";
import TouchInput from "../../components/TouchInput";
import { useNavigationBar } from "../../context/NavigationBarContext";
import { useKeyEvent } from "../../context/KeyEventContext";
import { useConnectionContext } from "../../context/ConnectionContext";

interface ConnectDialogProps {
  navigation: NavigationProp<any>;
}

const MinimalLoginScreen = ({ navigation }: ConnectDialogProps) => {
  const { setNavigation } = useNavigationBar();
  const { connect, disconnect } = useContext(SdkContext);
  const connectionContext = useConnectionContext();
  const { keyEvent } = useKeyEvent();

  const [credentials, setCredentials] = useState({
    username: "PA-25",
    password: "MwNLFn4s",
    network: "chaverimofnepa",
  });

  useFocusEffect(
    useCallback(() => {
      setNavigation("", "", "Connect");
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (connectionContext.isConnected) {
      navigation.reset({
        index: 0,
        routes: [{ name: "index" }],
      });
    }
  }, [connectionContext]);

  useEffect(() => {
    if (keyEvent === 295) {
      handleConnect();
    }
  }, [keyEvent]);

  const handleInputChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const isValidCredentials = useCallback(() => {
    const { username, password, network } = credentials;
    return username && password && network;
  }, [credentials]);

  const handleConnect = () => {
    if (!isValidCredentials()) return;

    disconnect();
    setTimeout(() => {
      connect(credentials);
    }, 100);
  };

  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Connect</Text>
        <TouchInput title="Username" value={credentials.username} onChangeText={(value: string) => handleInputChange("username", value)} />
        <TouchInput title="Password" value={credentials.password} onChangeText={(value: string) => handleInputChange("password", value)} secureTextEntry />
        <TouchInput title="Network" value={credentials.network} onChangeText={(value: string) => handleInputChange("network", value)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  modalView: {
    backgroundColor: "#323232",
    padding: 10,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#ef5e14",
    padding: 8,
    marginBottom: 10,
    width: "100%",
    backgroundColor: "#404040",
    color: "#fff",
  },
});

export default MinimalLoginScreen;
