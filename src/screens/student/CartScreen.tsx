import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../api";
import { AuthContext } from "../../contexts/AuthContext";
import { CartItem } from "../../types";
import { PICKUP_SLOTS } from "../../config";

interface Props {
  route: any;
  navigation: any;
}

export default function CartScreen({ route, navigation }: Props) {
  const { cart, canteenId, canteenName } = route.params as {
    cart: CartItem[];
    canteenId: string;
    canteenName: string;
  };
  const { user } = useContext(AuthContext);
  const [pickupSlot, setPickupSlot] = useState(PICKUP_SLOTS[0]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [placing, setPlacing] = useState(false);

  const [items, setItems] = useState<CartItem[]>(cart);

  const updateQuantity = (menuItemId: string, delta: number) => {
    setItems((prev) => {
      const updated = prev.map((c) =>
        c.menuItem._id === menuItemId
          ? { ...c, quantity: c.quantity + delta }
          : c
      );
      return updated.filter((c) => c.quantity > 0);
    });
  };

  const total = items.reduce(
    (sum, c) => sum + c.menuItem.price * c.quantity,
    0
  );

  const placeOrder = async () => {
    if (items.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }
    if (!user) return;

    setPlacing(true);
    try {
      const orderItems = items.map((c) => ({
        menuItemId: c.menuItem._id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        quantity: c.quantity,
      }));

      const res = await api.placeOrder({
        userId: user._id,
        userName: user.name,
        items: orderItems,
        paymentMethod,
        pickupSlot,
        canteenId,
      });

      const storedIds = await AsyncStorage.getItem("ordered_canteen_ids");
      const ids: string[] = storedIds ? JSON.parse(storedIds) : [];
      if (!ids.includes(canteenId)) {
        ids.push(canteenId);
        await AsyncStorage.setItem("ordered_canteen_ids", JSON.stringify(ids));
      }

      Alert.alert("Order Placed!", `Order #${res._id?.slice(-6) || ""} placed successfully`, [
        {
          text: "View Order",
          onPress: () => {
            navigation.navigate("OrderDetail", { orderId: res._id || res.order?._id, canteenId });
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(c) => c.menuItem._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Your Order</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.cartItemInfo}>
              <Text style={styles.cartItemName}>{item.menuItem.name}</Text>
              <Text style={styles.cartItemPrice}>
                ₹{item.menuItem.price * item.quantity}
              </Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.menuItem._id, -1)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.menuItem._id, 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCart}>
            <Text style={styles.emptyText}>Cart is empty</Text>
          </View>
        }
        ListFooterComponent={
          items.length > 0 ? (
            <View style={styles.footerContent}>
              <Text style={styles.sectionTitle}>Pickup Slot</Text>
              <View style={styles.slotGrid}>
                {PICKUP_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotChip, pickupSlot === slot && styles.slotChipActive]}
                    onPress={() => setPickupSlot(slot)}
                  >
                    <Text
                      style={[
                        styles.slotChipText,
                        pickupSlot === slot && styles.slotChipTextActive,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.paymentRow}>
                {["cash", "online", "upi"].map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentOption,
                      paymentMethod === method && styles.paymentOptionActive,
                    ]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text
                      style={[
                        styles.paymentText,
                        paymentMethod === method && styles.paymentTextActive,
                      ]}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      {items.length > 0 && (
        <View style={styles.checkoutBar}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, placing && styles.checkoutButtonDisabled]}
            onPress={placeOrder}
            disabled={placing}
          >
            {placing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkoutButtonText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3fc",
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    marginTop: 8,
  },
  cartItem: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#7c3aed",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f3ff",
    borderRadius: 12,
    overflow: "hidden",
  },
  qtyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7c3aed",
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 28,
    textAlign: "center",
    color: "#1f2937",
  },
  emptyCart: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  footerContent: {
    marginTop: 16,
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  slotChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  slotChipActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
  slotChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  slotChipTextActive: {
    color: "#fff",
  },
  paymentRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  paymentOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  paymentOptionActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  paymentTextActive: {
    color: "#fff",
  },
  checkoutBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  totalLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
  },
  checkoutButton: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  checkoutButtonDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
