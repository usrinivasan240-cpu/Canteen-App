import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "chef", label: "Chef" },
  { value: "staff", label: "Server" },
];

export default function LoginScreen() {
  const { login, register } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (isRegister && !name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password, role);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🍽️</Text>
          <Text style={styles.title}>Canteen App</Text>
          <Text style={styles.subtitle}>
            {isRegister ? "Create your account" : "Welcome back!"}
          </Text>
        </View>

        <View style={styles.form}>
          {isRegister && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.roleLabel}>Select Role</Text>
          <View style={styles.roleContainer}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.roleButton,
                  role === r.value && styles.roleButtonActive,
                ]}
                onPress={() => setRole(r.value)}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === r.value && styles.roleButtonTextActive,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isRegister ? "Register" : "Login"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsRegister(!isRegister)}
          >
            <Text style={styles.switchText}>
              {isRegister
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3fc",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#7c3aed",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#1f2937",
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 4,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  switchButton: {
    alignItems: "center",
    padding: 12,
  },
  switchText: {
    color: "#7c3aed",
    fontSize: 14,
    fontWeight: "600",
  },
});
