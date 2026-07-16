import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MenuItem } from "../types";

interface Props {
  item: MenuItem;
  onAdd?: () => void;
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export default function MenuItemCard({
  item,
  onAdd,
  quantity = 0,
  onIncrement,
  onDecrement,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </View>

      {item.available ? (
        quantity === 0 ? (
          <TouchableOpacity style={styles.addButton} onPress={onAdd}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={onDecrement}
            >
              <Text style={styles.qtyButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={onIncrement}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
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
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7c3aed",
  },
  category: {
    fontSize: 11,
    color: "#9ca3af",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  addButton: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f3ff",
    borderRadius: 12,
    overflow: "hidden",
  },
  qtyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7c3aed",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    minWidth: 24,
    textAlign: "center",
  },
  unavailableBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unavailableText: {
    color: "#991b1b",
    fontSize: 12,
    fontWeight: "600",
  },
});
