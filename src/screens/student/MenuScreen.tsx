import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { api } from "../../api";
import { MenuItem } from "../../types";
import { AuthContext } from "../../contexts/AuthContext";
import MenuItemCard from "../../components/MenuItemCard";
import EmptyState from "../../components/EmptyState";

interface Props {
  route: any;
  navigation: any;
}

export default function MenuScreen({ route, navigation }: Props) {
  const { canteenId, canteenName } = route.params;
  const { user } = useContext(AuthContext);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<
    { menuItem: MenuItem; quantity: number }[]
  >([]);

  const fetchMenu = useCallback(async () => {
    try {
      const data = await api.getMenu(canteenId);
      setMenu(data);
    } catch {}
    setLoading(false);
  }, [canteenId]);

  useEffect(() => {
    fetchMenu();
    const interval = setInterval(fetchMenu, 30000);
    return () => clearInterval(interval);
  }, [fetchMenu]);

  useEffect(() => {
    navigation.setOptions({ title: canteenName || "Menu" });
  }, [canteenName, navigation]);

  const filtered = menu.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(menu.map((i) => i.category))];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const displayItems = selectedCategory
    ? filtered.filter((i) => i.category === selectedCategory)
    : filtered;

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem._id === item._id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem._id === item._id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const increment = (itemId: string) => {
    setCart((prev) =>
      prev.map((c) =>
        c.menuItem._id === itemId ? { ...c, quantity: c.quantity + 1 } : c
      )
    );
  };

  const decrement = (itemId: string) => {
    setCart((prev) => {
      const updated = prev.map((c) =>
        c.menuItem._id === itemId ? { ...c, quantity: c.quantity - 1 } : c
      );
      return updated.filter((c) => c.quantity > 0);
    });
  };

  const getQuantity = (itemId: string) => {
    const found = cart.find((c) => c.menuItem._id === itemId);
    return found ? found.quantity : 0;
  };

  const cartTotal = cart.reduce(
    (sum, c) => sum + c.menuItem.price * c.quantity,
    0
  );
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const goToCart = () => {
    if (cart.length === 0) return;
    navigation.navigate("Cart", { cart, canteenId, canteenName });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search menu..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.categoryBar}>
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryChipText,
              !selectedCategory && styles.categoryChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7c3aed" style={styles.loader} />
      ) : (
        <FlatList
          data={displayItems}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <MenuItemCard
              item={item}
              quantity={getQuantity(item._id)}
              onAdd={() => addToCart(item)}
              onIncrement={() => increment(item._id)}
              onDecrement={() => decrement(item._id)}
            />
          )}
          contentContainerStyle={displayItems.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="🍽️"
              title="No items found"
              message="Try a different search or category"
            />
          }
        />
      )}

      {cartCount > 0 && (
        <TouchableOpacity style={styles.cartButton} onPress={goToCart}>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
          <Text style={styles.cartButtonText}>View Cart • ₹{cartTotal}</Text>
          <Text style={styles.cartArrow}>→</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3fc",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 8,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: "#1f2937",
  },
  categoryBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryChipActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  cartButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#7c3aed",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cartBadge: {
    backgroundColor: "#fff",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cartBadgeText: {
    color: "#7c3aed",
    fontWeight: "700",
    fontSize: 14,
  },
  cartButtonText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cartArrow: {
    color: "#fff",
    fontSize: 20,
  },
});
