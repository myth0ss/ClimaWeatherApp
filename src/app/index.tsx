import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { weatherBrain, WeatherData } from "../weatherBrain";

export default function ClimaScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [cityInput, setCityInput] = useState<string>("");
  const [cityName, setCityName] = useState<string>("Đang tải...");
  const [temperature, setTemperature] = useState<number>(0);
  const [weatherDescription, setWeatherDescription] = useState<string>("");
  const [weatherIcon, setWeatherIcon] = useState<string>("sunny-outline");
  const [message, setMessage] = useState<string>("");

  const updateUI = (data: WeatherData) => {
    setTemperature(data.temp);
    setCityName(data.cityName);
    setWeatherDescription(data.description);
    setWeatherIcon(data.icon);
    setMessage(data.message);
  };

  const fetchCurrentLocationWeather = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Thông báo",
          "Cần quyền vị trí để lấy thời tiết địa phương.",
        );
        setLoading(false);
        return;
      }

      let location = await Location.getLastKnownPositionAsync({});
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      if (location) {
        const data: WeatherData = await weatherBrain.getLocationWeather(
          location.coords.latitude,
          location.coords.longitude,
        );
        updateUI(data); // Hết báo đỏ dòng 66
      }
    } catch (error) {
      console.log("Lỗi vị trí:", error);
      Alert.alert("Lỗi", "Không thể đọc tọa độ GPS.");
    } finally {
      setLoading(false);
    }
  };

  const searchCity = async () => {
    if (!cityInput.trim()) return;
    try {
      setLoading(true);
      Keyboard.dismiss();
      const data: WeatherData = await weatherBrain.getCityWeather(
        cityInput.trim(),
      );
      updateUI(data); // Hết báo đỏ dòng 82
      setCityInput("");
    } catch {
      Alert.alert(
        "Không tìm thấy",
        `Không tìm thấy thông tin thời tiết cho "${cityInput}".`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentLocationWeather();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      {/* Thanh tìm kiếm */}
      <View style={styles.searchBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={fetchCurrentLocationWeather}
          activeOpacity={0.7}
        >
          <Ionicons name="location-sharp" size={26} color="#38bdf8" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nhập tên thành phố (vd: Hanoi, Paris)..."
          placeholderTextColor="#94a3b8"
          value={cityInput}
          onChangeText={setCityInput}
          onSubmitEditing={searchCity}
          returnKeyType="search"
        />

        <TouchableOpacity
          style={styles.iconButton}
          onPress={searchCity}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Nội dung thời tiết */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Đang lấy dữ liệu thời tiết...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.weatherInfo}>
            <Ionicons name={weatherIcon as any} size={110} color="#38bdf8" />
            <Text style={styles.tempText}>{temperature}°C</Text>
            <Text style={styles.descText}>{weatherDescription}</Text>
            <Text style={styles.cityText}>{cityName}</Text>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 48,
    color: "#ffffff",
    fontSize: 16,
    paddingHorizontal: 10,
  },
  iconButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#94a3b8",
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  weatherInfo: {
    alignItems: "center",
    marginTop: 30,
  },
  tempText: {
    fontSize: 84,
    fontWeight: "900",
    color: "#ffffff",
    marginTop: 10,
  },
  descText: {
    fontSize: 22,
    color: "#38bdf8",
    textTransform: "capitalize",
    marginTop: -4,
  },
  cityText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    marginTop: 12,
    textAlign: "center",
  },
  messageBox: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  messageText: {
    fontSize: 17,
    color: "#e2e8f0",
    textAlign: "center",
    lineHeight: 25,
  },
});
