import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    image: require("../../assets/Girl waving and sitting on the welcome sign.png"),
    title: "ShareSpace",
    description:
      "Navigate university life with ease. Connect with seniors, find guidance, and grow together!",
    button: "Next",
  },
  {
    id: "2",
    image: require("../../assets/young smiling man points with fingers to right side.png"),
    title: "What You Get",
    description:
      "✅ Find mentors & get support\n✅ Experience Sharing\n✅ Access valuable resources",
    button: "Next",
  },
  {
    id: "3",
    image: require("../../assets/Successful marketing team joins forces.png"),
    title: "ShareSpace",
    description:
      "Join as a Junior or Senior and start your journey today!",
    button: "Get Started",
  },
];

const OnboardingScreen = () => {
  const flatListRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigation = useNavigation();

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentSlide + 1 });
    } else {
      // 🔥 Save flag in AsyncStorage
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      navigation.replace("SigninScreen"); // ⬅️ Use replace to prevent back nav
    }
  };

  const updateSlide = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentSlide(index);
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {(item.id === "2" || item.id === "3") && (
        <Text style={styles.headerTitle}>ShareSpace</Text>
      )}
      <LinearGradient
        colors={["#fff5ea", "transparent"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.card}
      >
        <View style={styles.innerCard}>
          {item.id === "2" ? (
            <View style={styles.rowImageText}>
              <Image
                source={item.image}
                style={styles.sideImage}
                resizeMode="contain"
              />
              <Text style={styles.sideTitle}>{item.title}</Text>
            </View>
          ) : (
            <>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
              <Text style={styles.title}>{item.title}</Text>
            </>
          )}

          <Text
            style={[
              styles.description,
              item.id === "2" && styles.bulletDescription,
            ]}
          >
            {item.description}
          </Text>
        </View>

        <View>
          <View style={styles.indicatorContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentSlide === index && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleNext} style={styles.buttonWrapper}>
            <LinearGradient
              colors={["#f6a057", "#e17d27"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateSlide}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: width * 0.9,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e17d27",
    padding: 24,
    justifyContent: "space-between",
    alignItems: "center",
    height: "75%",
    backgroundColor: "#fff",
  },
  innerCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2f2f2f",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "orange",
    width: 10,
    height: 10,
  },
  buttonWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  rowImageText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  sideImage: {
    width: 100,
    height: 100,
    marginRight: 12,
  },
  sideTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2f2f2f",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    alignSelf: "center",
    marginBottom: 8,
  },
  bulletDescription: {
    textAlign: "left",
    paddingHorizontal: 16,
    lineHeight: 26,
    fontSize: 16,
    color: "#333",
    marginTop: 8,
    alignSelf: "stretch",
  },
});

export default OnboardingScreen;
