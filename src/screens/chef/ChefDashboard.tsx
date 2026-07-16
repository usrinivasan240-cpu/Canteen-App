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
import { Order, MenuItem } from "../../types";
import OrderCard from "../../components/OrderCard";
import EmptyState from "../../components/EmptyState";

type FilterTab = "pending" | "preparing" | "ready";

interface Props {
  navigation: any;
}

export default function ChefDashboard({ navigation }: Props) {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("pending");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.canteenId) return;
    try {
      const data = await api.getCanteen(user.canteenId);
      setOrders(data.orders || []);
      setMenu(data.menu || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "pending") return o.status === "pending" || o.status === "scheduled";
    if (activeTab === "preparing") return o.status === "preparing";
    return o.status === "ready";
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map((o) => o._id)));
    }
  };

  const batchUpdate = async (status: string) => {
    if (selectedIds.size === 0) {
      Alert.alert("Error", "Select orders first");
      return;
    }
    try {
      await api.batchUpdateStatus(Array.from(selectedIds), status);
      setSelectedIds(new Set());
      setBatchMode(false);
      fetchData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update");
    }
  };

  const updateSingleStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      fetchData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update");
    }
  };

  const getNextAction = (status: string) => {
    if (status === "pending" || status === "scheduled") {
      return { label: "Start Preparing", nextStatus: "preparing" };
    }
    if (status === "preparing") {
      return { label: "Mark Ready", nextStatus: "ready" };
    }
    return null;
  };

  const slotDemands = orders
    .filter((o) => !["collected", "delivered"].includes(o.status))
    .reduce<Record<string, number>>((acc, o) => {
      acc[o.pickupSlot] = (acc[o.pickupSlot] || 0) + 1;
      return acc;
    }, {});

  const ingredientMap = new Map<string, number>();
  orders
    .filter((o) => !["collected", "delivered"].includes(o.status))
    .forEach((order) => {
      order.items.forEach((item) => {
        const existing = ingredientMap.get(item.name) || 0;
        ingredientMap.set(item.name, existing + item.quantity);
      });
    });

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {(["pending", "preparing", "ready"] as FilterTab[]).map((tab) => {
          const count = orders.filter((o) => {
            if (tab === "pending") return o.status === "pending" || o.status === "scheduled";
            return o.status === tab;
          }).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => {
                setActiveTab(tab);
                setSelectedIds(new Set());
                setBatchMode(false);
              }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {count > 0 && (
                <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, activeTab === tab && styles.tabBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.batchToggle, batchMode && styles.batchToggleActive]}
          onPress={() => {
            setBatchMode(!batchMode);
            setSelectedIds(new Set());
          }}
        >
          <Text style={[styles.batchToggleText, batchMode && styles.batchToggleTextActive]}>
            {batchMode ? "Cancel" : "Batch Mode"}
          </Text>
        </TouchableOpacity>

        {batchMode && (
          <>
            <TouchableOpacity style={styles.toolbarBtn} onPress={selectAll}>
              <Text style={styles.toolbarBtnText}>Select All</Text>
            </TouchableOpacity>
            {activeTab === "pending" && (
              <TouchableOpacity
                style={styles.toolbarBtnAction}
                onPress={() => batchUpdate("preparing")}
              >
                <Text style={styles.toolbarBtnActionText}>
                  Mark Preparing ({selectedIds.size})
                </Text>
              </TouchableOpacity>
            )}
            {activeTab === "preparing" && (
              <TouchableOpacity
                style={styles.toolbarBtnAction}
                onPress={() => batchUpdate("ready")}
              >
                <Text style={styles.toolbarBtnActionText}>
                  Mark Ready ({selectedIds.size})
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7c3aed" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7c3aed"
            />
          }
          contentContainerStyle={
            filteredOrders.length === 0 ? styles.emptyContainer : styles.listContent
          }
          ListHeaderComponent={
            filteredOrders.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {activeTab === "pending"
                    ? "Pending & Scheduled"
                    : activeTab === "preparing"
                    ? "Currently Preparing"
                    : "Ready for Pickup"}
                </Text>
                <Text style={styles.sectionCount}>{filteredOrders.length} orders</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View>
              <OrderCard
                order={item}
                showActions={batchMode}
                selected={selectedIds.has(item._id)}
                onToggleSelect={() => toggleSelect(item._id)}
                onPress={
                  batchMode ? undefined : () => {
                    const action = getNextAction(item.status);
                    if (action) {
                      Alert.alert(
                        "Update Status",
                        `Mark as "${action.nextStatus}"?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: action.label,
                            onPress: () =>
                              updateSingleStatus(item._id, action.nextStatus),
                          },
                        ]
                      );
                    }
                  }
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="👨‍🍳"
              title="No orders"
              message={`No ${activeTab} orders at the moment`}
            />
          }
        />
      )}

      <View style={styles.infoBar}>
        <TouchableOpacity
          style={styles.infoTab}
          onPress={() =>
            Alert.alert(
              "Slot Demands",
              Object.entries(slotDemands)
                .map(([slot, count]) => `${slot}: ${count} orders`)
                .join("\n") || "No pending orders"
            )
          }
        >
          <Text style={styles.infoTabLabel}>Slots</Text>
          <Text style={styles.infoTabValue}>{Object.keys(slotDemands).length}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.infoTab}
          onPress={() =>
            Alert.alert(
              "Ingredient Needs",
              Array.from(ingredientMap.entries())
                .map(([name, qty]) => `${qty}x ${name}`)
                .join("\n") || "No pending orders"
            )
          }
        >
          <Text style={styles.infoTabLabel}>Items</Text>
          <Text style={styles.infoTabValue}>{ingredientMap.size}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3fc",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    gap: 6,
  },
  tabActive: {
    backgroundColor: "#7c3aed",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#fff",
  },
  tabBadge: {
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  tabBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
  },
  tabBadgeTextActive: {
    color: "#fff",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  batchToggle: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
  },
  batchToggleActive: {
    borderColor: "#7c3aed",
    backgroundColor: "#f5f3ff",
  },
  batchToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  batchToggleTextActive: {
    color: "#7c3aed",
  },
  toolbarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  toolbarBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  toolbarBtnAction: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#7c3aed",
  },
  toolbarBtnActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  sectionCount: {
    fontSize: 13,
    color: "#9ca3af",
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  infoBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingBottom: 30,
  },
  infoTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#f3f4f6",
  },
  infoTabLabel: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "500",
  },
  infoTabValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#7c3aed",
  },
});
