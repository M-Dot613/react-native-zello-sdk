import React, { useEffect, useRef, useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, TextInputProps, Pressable } from "react-native";

interface TouchInputProps extends TextInputProps {
  title: string;
  value: string;
  editable?: boolean;
  secureTextEntry?: boolean;
  onChangeText: (text: string) => void;
}

const TouchInput: React.FC<TouchInputProps> = ({ title, value, editable = true, secureTextEntry, onChangeText }) => {
  // Create a ref for the TextInput
  const inputRef = useRef<TextInput>(null);
  const [isPressed, setIsPressed] = useState(false); // State to track if TouchableOpacity is pressed

  // useEffect(() => {
  //   console.log(title, inputRef.current?.isFocused(), "nn");
  // }, []);

  return (
    <Pressable
      onPressIn={() => setIsPressed(true)} // Set pressed state to true when pressed
      onPressOut={() => setIsPressed(false)} // Set pressed state to false when released
      onPress={() => {
        inputRef.current?.focus();
      }}
      style={[styles.touchable, isPressed && styles.touchablePressed]} // Change style based on pressed state
      onHoverIn={() => console.log("hover in")}
    >
      <TextInput
        value={value}
        editable={editable}
        ref={inputRef} // Attach ref to the TextInput
        style={styles.input}
        placeholder={title}
        autoCapitalize="none"
        onChangeText={onChangeText}
        placeholderTextColor={"#c4c4c4"}
        secureTextEntry={secureTextEntry}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: "100%",
    borderBottomWidth: 2,
    borderBottomColor: "#ef5e14",
    paddingHorizontal: 3,
    marginBottom: 10,
    backgroundColor: "#404040",
    color: "#fff",
    borderTopRightRadius: 3,
    borderTopLeftRadius: 3,
  },
  touchablePressed: {
    backgroundColor: "red", // Change background color when pressed
  },
  input: {
    height: 40,
    color: "#fff",
  },
});

export default TouchInput;
