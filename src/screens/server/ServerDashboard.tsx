import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { api } from "../../api";
import { AuthContext } from "../../contexts/AuthContext";
import { Order } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

type Column = "preparing" | "ready" | "served";

interface Props {
  navigation: any;
}

export default function ServerDashboard({ navigation }: Props) {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user?.canteenId) return;
    try {
      const data = await api.getCanteen(user.canteenId);
      setOrders(data.orders || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");
  const servedOrders = orders.filter((o) =>
    ["collected", "delivered"].includes(o.status)
  );

  const markServed = async (orderId: string) => {
    try {
      await api.updateOrderStatus(orderId, "delivered");
      fetchOrders();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update");
    }
  };

  const renderColumn = (title: string, data: Order[], column: Column) => (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <Text style={styles.columnTitle}>{title}</Text>
        <View style={styles.columnBadge}>
          <Text style={styles.columnBadgeText}>{data.length}</Text>
        </View>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        contentContainerStyle={
          data.length === 0 ? styles.columnEmpty : styles.columnContent
        }
        ListEmptyComponent={
          <Text style={styles.emptyColumnText}>No orders</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.miniCard}>
            <View style={styles.miniCardHeader}>
              <Text style={styles.miniCardUser}>{item.userName}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.miniCardSlot}>Pickup: {item.pickupSlot}</Text>
            <Text style={styles.miniCardTotal}>₹{item.total}</Text>
            {column === "ready" && (
              <TouchableOpacity
                style={styles.servedButton}
                onPress={() => markServed(item._id)}
              >
                <Text style={styles.servedButtonText}>Mark Served</Text>
              </TouchableOpacity>
            )}
            {column === "preparing" && (
              <TouchableOpacity
                style={styles.readyButton}
                onPress={async () => {
                  try {
                    await api.updateOrderStatus(item._id, "ready");
                    fetchOrders();
                  } catch (err: any) {
                    Alert.alert("Error", err.message);
                  }
                }}
              >
                <Text style={styles.readyButtonText}>Mark Ready</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Board</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate("QRScanner")}
        >
          <Text style={styles.scanButtonText}>📷 Scan QR</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7c3aed" style={styles.loader} />
      ) : (
        <View style={styles.board}>
          {renderColumn("Preparing", preparingOrders, "preparing")}
          {renderColumn("Ready", readyOrders, "ready")}
          {renderColumn("Served", servedOrders, "served")}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
  },
  scanButton: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  board: {
    flex: 1,
    flexDirection: "row",
  },
  column: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#f3f4f6",
  },
  columnHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
  columnBadge: {
    backgroundColor: "#7c3aed",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  columnBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  columnContent: {
    padding: 8,
    paddingBottom: 20,
  },
  columnEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyColumnText: {
    fontSize: 12,
    color: "#d1d5db",
    textAlign: "center",
  },
  miniCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  miniCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  miniCardUser: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  miniCardSlot: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 4,
  },
  miniCardTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7c3aed",
    marginBottom: 6,
  },
  servedButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  servedButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  readyButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  readyButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
});
