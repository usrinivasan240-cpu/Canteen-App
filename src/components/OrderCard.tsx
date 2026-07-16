import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Order } from "../types";
import StatusBadge from "./StatusBadge";

interface Props {
  order: Order;
  onPress?: () => void;
  showActions?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export default function OrderCard({
  order,
  onPress,
  showActions,
  selected,
  onToggleSelect,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {showActions && (
            <TouchableOpacity
              style={[styles.checkbox, selected && styles.checkboxChecked]}
              onPress={onToggleSelect}
            >
              {selected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.userName}>{order.userName}</Text>
            <Text style={styles.time}>
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.itemsContainer}>
        {order.items.map((item, idx) => (
          <Text key={idx} style={styles.itemText}>
            {item.quantity}x {item.name}
          </Text>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.total}>₹{order.total}</Text>
        <Text style={styles.slot}>Pickup: {order.pickupSlot}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  selected: {
    borderWidth: 2,
    borderColor: "#7c3aed",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  time: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 10,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7c3aed",
  },
  slot: {
    fontSize: 13,
    color: "#6b7280",
  },
});
