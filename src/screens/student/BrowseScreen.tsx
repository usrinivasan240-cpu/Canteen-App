import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { api } from "../../api";

const COLLEGES = [
  { id: "canteen1", name: "Main Canteen", subtitle: "Central food court" },
  { id: "canteen2", name: "North Block Canteen", subtitle: "Near CS department" },
  { id: "canteen3", name: "South Block Canteen", subtitle: "Near ECE department" },
  { id: "canteen4", name: "Cafeteria", subtitle: "Snacks & beverages" },
];

interface Props {
  navigation: any;
}

export default function BrowseScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // We just need to verify the API is reachable
      await api.getCanteen("canteen1");
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={COLLEGES}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.greeting}>Browse Canteens</Text>
            <Text style={styles.subtitle}>Select a canteen to view menu</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("CanteenMenu", {
                canteenId: item.id,
                canteenName: item.name,
              })
            }
          >
            <View style={styles.cardIcon}>
              <Text style={styles.iconText}>🍽️</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3fc",
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
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
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#f5f3ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconText: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#9ca3af",
  },
  arrow: {
    fontSize: 20,
    color: "#d1d5db",
  },
});
