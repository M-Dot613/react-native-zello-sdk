import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigationBar } from "../context/NavigationBarContext";

const NavigationBar: React.FC = () => {
  const { items } = useNavigationBar();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{items.first}</Text>
      <Text style={styles.text}>{items.second}</Text>
      <Text style={styles.text}>{items.third}</Text>
    </View>
  );
};

export default NavigationBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    backgroundColor: "#000",
  },
  text: {
    textAlign: "center",
    color: "#fff",
    width: "33.33%",
    fontWeight: "bold",
  },
});
