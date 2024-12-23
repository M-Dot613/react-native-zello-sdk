import React, { useCallback, useEffect, useState } from "react";
import {  StyleSheet, Text, TextInput, View, } from "react-native";
import TouchInput from "../TouchInput";
import { useNavigationBar } from "../../context/NavigationBarContext";
import { useKeyEvent } from "../../context/KeyEventContext";
import { useFocusEffect } from "@react-navigation/native";

interface ConnectDialogProps {
  onConnect: (username: string, password: string, network: string) => void;
}

const ConnectionModal: React.FC<ConnectDialogProps> = ({ onConnect }) => {
  // const { resetNav, setNav } = useNavigationBar();
  const { keyEvent } = useKeyEvent();

  const [credentials, setCredentials] = useState({
    username: "PA-25",
    password: "MwNLFn4s",
    network: "chaverimofnepa",
  });

    useFocusEffect(
      useCallback(() => {
        console.log("Focused ConnectionModal");
        return () => {
          console.log("Unfocused ConnectionModal");
        };
      }, [])
    );

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
    const { username, password, network } = credentials;
    onConnect(username, password, network);
  };

  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Deprecated</Text>
        <TouchInput title="Username" value={credentials.username} onChangeText={(value) => handleInputChange("username", value)} />
        <TouchInput title="Password" value={credentials.password} onChangeText={(value) => handleInputChange("password", value)} secureTextEntry />
        <TouchInput title="Network" value={credentials.network} onChangeText={(value) => handleInputChange("network", value)} />

        {/* <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          <TouchableOpacity
              onPress={handleConnect}
              style={[styles.button, styles.connectButton, !isValidCredentials() && styles.disabledButton]}
              disabled={!isValidCredentials()}
            >
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
        </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    position: "absolute",
    width: "100%",
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ff4d4d",
  },
  connectButton: {
    backgroundColor: "#4caf50",
  },
  disabledButton: {
    backgroundColor: "#a9a9a9",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default ConnectionModal;