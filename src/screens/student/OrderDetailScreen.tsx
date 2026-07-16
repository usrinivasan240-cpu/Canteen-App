import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { api } from "../../api";
import { AuthContext } from "../../contexts/AuthContext";
import { Order } from "../../types";
import StatusBadge from "../../components/StatusBadge";

interface Props {
  route: any;
  navigation: any;
}

export default function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId, canteenId } = route.params;
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getCanteen(canteenId);
      const allOrders: Order[] = data.orders || [];
      const found = allOrders.find((o) => o._id === orderId);
      if (found) setOrder(found);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [user, orderId, canteenId]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const statusSteps = ["pending", "scheduled", "preparing", "ready", "collected"];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#7c3aed"
        />
      }
    >
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
          <StatusBadge status={order.status} />
        </View>
        <Text style={styles.date}>
          {new Date(order.createdAt).toLocaleDateString()}{" "}
          {new Date(order.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        {statusSteps.map((step, idx) => (
          <View key={step} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                idx <= currentStepIndex && styles.progressDotActive,
                idx < currentStepIndex && styles.progressDotCompleted,
              ]}
            >
              {idx < currentStepIndex && <Text style={styles.progressCheck}>✓</Text>}
            </View>
            {idx < statusSteps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  idx < currentStepIndex && styles.progressLineActive,
                ]}
              />
            )}
            <Text
              style={[
                styles.progressLabel,
                idx <= currentStepIndex && styles.progressLabelActive,
              ]}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      {order.qrCode && (
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>Show this QR at pickup</Text>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrCode}>{order.qrCode}</Text>
          </View>
          <Text style={styles.qrHint}>Pickup Slot: {order.pickupSlot}</Text>
        </View>
      )}

      <View style={styles.itemsCard}>
        <Text style={styles.cardTitle}>Order Items</Text>
        {order.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{order.total}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment</Text>
          <Text style={styles.infoValue}>
            {order.paymentMethod.charAt(0).toUpperCase() +
              order.paymentMethod.slice(1)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pickup Slot</Text>
          <Text style={styles.infoValue}>{order.pickupSlot}</Text>
        </View>
      </View>

      {["collected", "delivered"].includes(order.status) && (
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() =>
            navigation.navigate("Review", {
              orderId: order._id,
              canteenId: order.canteenId,
            })
          }
        >
          <Text style={styles.reviewButtonText}>Rate this order</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3fc",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f3fc",
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  date: {
    fontSize: 13,
    color: "#9ca3af",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  progressStep: {
    flex: 1,
    alignItems: "center",
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  progressDotActive: {
    backgroundColor: "#7c3aed",
  },
  progressDotCompleted: {
    backgroundColor: "#10b981",
  },
  progressCheck: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  progressLine: {
    position: "absolute",
    top: 12,
    left: "60%",
    right: "-60%",
    height: 3,
    backgroundColor: "#e5e7eb",
    zIndex: 0,
  },
  progressLineActive: {
    backgroundColor: "#7c3aed",
  },
  progressLabel: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 6,
    fontWeight: "500",
  },
  progressLabelActive: {
    color: "#7c3aed",
    fontWeight: "600",
  },
  qrCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: "#f5f3ff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#7c3aed",
    borderStyle: "dashed",
  },
  qrCode: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7c3aed",
    textAlign: "center",
    padding: 10,
  },
  qrHint: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  itemsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemName: {
    fontSize: 14,
    color: "#4b5563",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#7c3aed",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  reviewButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  reviewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
