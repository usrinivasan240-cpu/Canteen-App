import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { api } from "../../api";

interface Props {
  navigation: any;
}

export default function QRScannerScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const verifyCode = async (code: string) => {
    if (verifying) return;
    setVerifying(true);
    try {
      const result = await api.verifyQR(code);
      if (result.valid) {
        Alert.alert(
          "Order Verified",
          `Order #${result.order?._id?.slice(-6) || ""}\nStatus: ${result.order?.status}`,
          [
            {
              text: "Mark as Served",
              onPress: async () => {
                try {
                  await api.updateOrderStatus(result.order!._id, "delivered");
                  Alert.alert("Done", "Order marked as delivered", [
                    { text: "OK", onPress: () => navigation.goBack() },
                  ]);
                } catch (err: any) {
                  Alert.alert("Error", err.message || "Failed to update");
                }
              },
            },
            {
              text: "Close",
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert("Invalid QR", result.message || "This QR code is not valid");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to verify QR code");
    } finally {
      setVerifying(false);
      setScanned(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    verifyCode(data);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert("Error", "Enter a code");
      return;
    }
    verifyCode(manualCode.trim());
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permTitle}>Camera Permission Required</Text>
        <Text style={styles.permText}>
          We need camera access to scan QR codes
        </Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <View style={styles.manualSection}>
          <Text style={styles.manualLabel}>Or enter code manually:</Text>
          <View style={styles.manualRow}>
            <TextInput
              style={styles.manualInput}
              placeholder="Enter QR code"
              placeholderTextColor="#9ca3af"
              value={manualCode}
              onChangeText={setManualCode}
            />
            <TouchableOpacity
              style={[styles.manualButton, verifying && styles.manualButtonDisabled]}
              onPress={handleManualSubmit}
              disabled={verifying}
            >
              <Text style={styles.manualButtonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.instruction}>Align QR code within the frame</Text>
          {scanned && (
            <View style={styles.scannedOverlay}>
              <Text style={styles.scannedText}>Processing...</Text>
            </View>
          )}
        </View>
      </CameraView>

      <View style={styles.bottomSection}>
        <Text style={styles.manualLabel}>Or enter code manually:</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="Enter QR code"
            placeholderTextColor="#9ca3af"
            value={manualCode}
            onChangeText={setManualCode}
          />
          <TouchableOpacity
            style={[styles.manualButton, verifying && styles.manualButtonDisabled]}
            onPress={handleManualSubmit}
            disabled={verifying}
          >
            <Text style={styles.manualButtonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f3fc",
    padding: 40,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  permText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  permButton: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 40,
  },
  permButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  manualSection: {
    width: "100%",
    paddingHorizontal: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  instruction: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 24,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scannedOverlay: {
    position: "absolute",
    top: 60,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scannedText: {
    color: "#fff",
    fontWeight: "600",
  },
  bottomSection: {
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 40,
  },
  manualLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 10,
    textAlign: "center",
  },
  manualRow: {
    flexDirection: "row",
    gap: 10,
  },
  manualInput: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1f2937",
  },
  manualButton: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
  },
  manualButtonDisabled: {
    opacity: 0.6,
  },
  manualButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
