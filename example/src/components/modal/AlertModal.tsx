import React, { useState } from "react";
import { Modal, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface AlertModalProps {
  channel: string;
  count: number;
}

const AlertModal: React.FC<AlertModalProps> = ({ channel, count }) => {
  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Ionicons name="warning-outline" size={50} color="#ff4d4d" />
        <Text style={styles.modalText}>Sending Alert to:</Text>
        <Text style={styles.modalText}>00 - Dispatch</Text>
        <Text style={styles.modalText}>{count}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    position: "absolute",
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "#323232",
    padding: 20,
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
  dismissButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default AlertModal;
