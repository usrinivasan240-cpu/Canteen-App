import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { api } from "../../api";
import { AuthContext } from "../../contexts/AuthContext";

interface Props {
  route: any;
  navigation: any;
}

export default function ReviewScreen({ route, navigation }: Props) {
  const { orderId, canteenId } = route.params;
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      await api.submitReview({
        userId: user._id,
        userName: user.name,
        rating,
        comment,
        canteenId,
      });
      Alert.alert("Thank you!", "Your review has been submitted", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Rate your experience</Text>
        <Text style={styles.subtitle}>How was your order?</Text>

        <View style={styles.starsRow}>
          {stars.map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Text style={[styles.star, rating >= star && styles.starActive]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.ratingText}>
          {rating === 0
            ? "Tap a star to rate"
            : rating <= 2
            ? "Poor"
            : rating === 3
            ? "Average"
            : rating === 4
            ? "Good"
            : "Excellent"}
        </Text>

        <Text style={styles.label}>Comment (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Tell us about your experience..."
          placeholderTextColor="#9ca3af"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={submitReview}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3fc",
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 30,
  },
  starsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 44,
    color: "#e5e7eb",
  },
  starActive: {
    color: "#f59e0b",
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7c3aed",
    marginBottom: 32,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#1f2937",
    minHeight: 120,
    marginBottom: 24,
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
