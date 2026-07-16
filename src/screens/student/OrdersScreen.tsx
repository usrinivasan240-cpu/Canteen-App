import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../api";
import { AuthContext } from "../../contexts/AuthContext";
import { Order } from "../../types";
import OrderCard from "../../components/OrderCard";
import EmptyState from "../../components/EmptyState";

interface Props {
  navigation: any;
}

export default function OrdersScreen({ navigation }: Props) {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const storedIds = await AsyncStorage.getItem("ordered_canteen_ids");
      const canteenIds: string[] = storedIds ? JSON.parse(storedIds) : [];

      const allOrders: Order[] = [];
      for (const cid of canteenIds) {
        try {
          const data = await api.getCanteen(cid);
          const canteenOrders: Order[] = data.orders || [];
          allOrders.push(...canteenOrders.filter((o) => o.userId === user._id));
        } catch {}
      }

      allOrders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(allOrders);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const activeOrders = orders.filter(
    (o) => !["collected", "delivered"].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ["collected", "delivered"].includes(o.status)
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#7c3aed" style={styles.loader} />
      ) : (
        <FlatList
          data={[...activeOrders, ...pastOrders]}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7c3aed"
            />
          }
          contentContainerStyle={
            orders.length === 0 ? styles.emptyContainer : styles.listContent
          }
          ListHeaderComponent={
            orders.length > 0 ? (
              <Text style={styles.headerTitle}>My Orders</Text>
            ) : null
          }
          renderItem={({ item, index }) => (
            <View>
              {index === activeOrders.length && activeOrders.length > 0 && (
                <Text style={styles.sectionDivider}>Past Orders</Text>
              )}
              <OrderCard
                order={item}
                onPress={() =>
                  navigation.navigate("OrderDetail", {
                    orderId: item._id,
                    canteenId: item.canteenId,
                  })
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="📋"
              title="No orders yet"
              message="Your orders will appear here once you place one"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3fc",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionDivider: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9ca3af",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 10,
  },
});
