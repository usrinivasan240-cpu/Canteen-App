import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  status: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
  scheduled: { bg: "#dbeafe", text: "#1e40af", label: "Scheduled" },
  preparing: { bg: "#fce7f3", text: "#9d174d", label: "Preparing" },
  ready: { bg: "#d1fae5", text: "#065f46", label: "Ready" },
  collected: { bg: "#e0e7ff", text: "#3730a3", label: "Collected" },
  delivered: { bg: "#d1fae5", text: "#065f46", label: "Delivered" },
};

export default function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] || {
    bg: "#f3f4f6",
    text: "#374151",
    label: status,
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
