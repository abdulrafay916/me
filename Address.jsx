import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import ThemedView from "../../components/ThemedView";
import { useTheme } from "../../contexts/ThemeContext";
import Spacer from "../../components/Spacer";
import KycLayout from "./kyc_layout";
import { Dropdown } from "react-native-element-dropdown";

const Address = () => {
  const { theme, themeMode } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [isAddressDetailsEntered, setIsAddressDetailsEntered] = useState(false);
  
  const [formData, setFormData] = useState({
    addressBuilding: "",
    addressCity: "",
    addressUnitNumber: "",
    residingCountryCode: "",
    addressStreet: "",
    addressZipCode: "",
    addressPostBox: "",
    addressDistrict: "",
    addressLocationCoordinates: "",
  });

  const [initialValues, setInitialValues] = useState({});

  const countries = [
    { label: "Saudi Arabia", value: "SA" },
    { label: "United Arab Emirates", value: "AE" },
    { label: "Qatar", value: "QA" },
    { label: "Kuwait", value: "KW" },
    { label: "Bahrain", value: "BH" },
    { label: "Oman", value: "OM" },
    { label: "Jordan", value: "JO" },
    { label: "Egypt", value: "EG" },
    { label: "Lebanon", value: "LB" },
    { label: "Iraq", value: "IQ" },
    { label: "Syria", value: "SY" },
    { label: "Yemen", value: "YE" },
    { label: "Palestine", value: "PS" },
    { label: "Turkey", value: "TR" },
    { label: "Iran", value: "IR" },
    { label: "Pakistan", value: "PK" },
    { label: "India", value: "IN" },
    { label: "Bangladesh", value: "BD" },
    { label: "Sri Lanka", value: "LK" },
    { label: "Nepal", value: "NP" },
    { label: "Philippines", value: "PH" },
    { label: "Indonesia", value: "ID" },
    { label: "Malaysia", value: "MY" },
    { label: "Thailand", value: "TH" },
    { label: "Vietnam", value: "VN" },
    { label: "China", value: "CN" },
    { label: "Japan", value: "JP" },
    { label: "South Korea", value: "KR" },
    { label: "United States", value: "US" },
    { label: "United Kingdom", value: "GB" },
    { label: "Germany", value: "DE" },
    { label: "France", value: "FR" },
    { label: "Italy", value: "IT" },
    { label: "Spain", value: "ES" },
    { label: "Canada", value: "CA" },
    { label: "Australia", value: "AU" },
    { label: "New Zealand", value: "NZ" },
    { label: "South Africa", value: "ZA" },
    { label: "Uganda", value: "UG" },
    { label: "Tanzania", value: "TZ" },
  ];

  // Regex patterns for validation
  const regexPatterns = {
    addressBuilding: /^[a-zA-Z0-9\s\-\.\/]*$/,
    onlyLetters: /^[a-zA-Z\s]*$/,
    alphaNumeric: /^[a-zA-Z0-9\s]*$/,
    street: /^[a-zA-Z0-9\s\-\.\/]*$/,
    coordinates: /^[0-9\.\-\s]*$/,
  };

  // Fetch address data from AsyncStorage
  useEffect(() => {
    const loadAddressData = async () => {
      try {
        const addressBuilding = await AsyncStorage.getItem("addressBuilding");
        const addressCity = await AsyncStorage.getItem("addressCity");
        const addressUnitNumber = await AsyncStorage.getItem("addressUnitNumber");
        const residingCountryCode = await AsyncStorage.getItem("residingCountryCode");
        const addressStreet = await AsyncStorage.getItem("addressStreet");
        const addressZipCode = await AsyncStorage.getItem("addressZipCode");
        const addressPostBox = await AsyncStorage.getItem("addressPostBox");
        const addressDistrict = await AsyncStorage.getItem("addressDistrict");
        const addressLocationCoordinates = await AsyncStorage.getItem("addressLocationCoordinates");
        const isAddressEntered = await AsyncStorage.getItem("isAddressEntered");

        const data = {
          addressBuilding: addressBuilding || "",
          addressCity: addressCity || "",
          addressUnitNumber: addressUnitNumber || "",
          residingCountryCode: residingCountryCode || "",
          addressStreet: addressStreet || "",
          addressZipCode: addressZipCode || "",
          addressPostBox: addressPostBox || "",
          addressDistrict: addressDistrict || "",
          addressLocationCoordinates: addressLocationCoordinates || "",
        };

        setFormData(data);
        setInitialValues(data);
        setIsAddressDetailsEntered(isAddressEntered === "true");
      } catch (error) {
        Alert.alert("Error", "Failed to load address data from storage.");
      } finally {
        setLoading(false);
      }
    };

    loadAddressData();
  }, []);

  // Check if data has changed
  useEffect(() => {
    if (Object.keys(initialValues).length === 0) return;

    const addressFields = [
      "addressBuilding",
      "addressCity", 
      "addressUnitNumber",
      "residingCountryCode",
      "addressStreet",
      "addressZipCode",
      "addressPostBox",
      "addressDistrict",
      "addressLocationCoordinates"
    ];

    const changed = addressFields.some((field) => {
      return initialValues[field] !== formData[field];
    });

    setIsDataChanged(changed);
  }, [formData, initialValues]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateInput = (value, pattern) => {
    return pattern ? pattern.test(value) : true;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each field to AsyncStorage
      await AsyncStorage.setItem("addressBuilding", formData.addressBuilding);
      await AsyncStorage.setItem("addressCity", formData.addressCity);
      await AsyncStorage.setItem("addressUnitNumber", formData.addressUnitNumber);
      await AsyncStorage.setItem("residingCountryCode", formData.residingCountryCode);
      await AsyncStorage.setItem("addressStreet", formData.addressStreet);
      await AsyncStorage.setItem("addressZipCode", formData.addressZipCode);
      await AsyncStorage.setItem("addressPostBox", formData.addressPostBox);
      await AsyncStorage.setItem("addressDistrict", formData.addressDistrict);
      await AsyncStorage.setItem("addressLocationCoordinates", formData.addressLocationCoordinates);
      await AsyncStorage.setItem("isAddressEntered", "true");

      setInitialValues({ ...formData });
      setIsDataChanged(false);
      Alert.alert("Saved", "Address details saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save address details.");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (isDataChanged) {
      const success = await handleSave();
      if (!success) return;
    }
    
    const customerCategory = await AsyncStorage.getItem("customerCategory");
    const isCorporate = customerCategory === "Corporate";
    
    Alert.alert("Saved", "Address details recorded successfully!");
    router.push(isCorporate ? "/kyc/business" : "/kyc/personal");
  };

  const handlePrev = async () => {
    if (isDataChanged) {
      const success = await handleSave();
      if (!success) return;
    }
    
    router.push("/kyc/identity");
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel",
      "Are you sure you want to cancel? All unsaved changes will be lost.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          onPress: () => {
            AsyncStorage.clear();
            router.push("/login");
          }
        }
      ]
    );
  };

  const renderFormField = (fieldName, label, isRequired = false, keyboardType = "default", validationPattern = null) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.text }]}>
        {label}
        {isRequired && <Text style={{ color: "#EF4444" }}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: isAddressDetailsEntered ? theme.background2 : theme.background,
            color: theme.text,
            borderColor: theme.text
          }
        ]}
        value={formData[fieldName] || ""}
        editable={!isAddressDetailsEntered}
        keyboardType={keyboardType}
        onChangeText={(text) => {
          if (validateInput(text, validationPattern)) {
            handleInputChange(fieldName, text);
          }
        }}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={theme.text + "80"}
      />
    </View>
  );

  const getCountryName = (countryCode) => {
    const country = countries.find(c => c.value === countryCode);
    return country ? country.label : countryCode;
  };

  if (loading) {
    return (
      <ThemedView style={styles.loader}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: theme.text, marginTop: 8 }}>Loading...</Text>
      </ThemedView>
    );
  }

  return (
    <KycLayout
      step={2}
      totalSteps={10}
      topHeading="Verify"
      leftHeading="Address"
      rightContent={
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* First Row */}
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                {renderFormField(
                  "addressBuilding",
                  "Address Building",
                  true,
                  "default",
                  regexPatterns.addressBuilding
                )}
              </View>
              <View style={styles.halfWidth}>
                {renderFormField(
                  "addressCity",
                  "Address City",
                  true,
                  "default",
                  regexPatterns.onlyLetters
                )}
              </View>
            </View>

            {/* Second Row */}
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                {renderFormField(
                  "addressUnitNumber",
                  "Address Unit Number",
                  true,
                  "default",
                  regexPatterns.alphaNumeric
                )}
              </View>
              <View style={styles.halfWidth}>
                <View style={styles.fieldContainer}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Residing Country
                    <Text style={{ color: "#EF4444" }}> *</Text>
                  </Text>
                  {isAddressDetailsEntered ? (
                    <TextInput
                      style={[
                        styles.input, 
                        { 
                          backgroundColor: theme.background2, 
                          color: theme.text,
                          borderColor: theme.text
                        }
                      ]}
                      value={getCountryName(formData.residingCountryCode)}
                      editable={false}
                    />
                  ) : (
                    <Dropdown
                      style={[
                        styles.dropdown, 
                        { 
                          backgroundColor: theme.background, 
                          borderColor: theme.text 
                        }
                      ]}
                      placeholderStyle={[styles.placeholderStyle, { color: theme.text }]}
                      selectedTextStyle={[styles.selectedTextStyle, { color: theme.text }]}
                      inputSearchStyle={[styles.inputSearchStyle, { color: theme.text }]}
                      iconStyle={styles.iconStyle}
                      data={countries}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder="Select country"
                      searchPlaceholder="Search..."
                      value={formData.residingCountryCode}
                      onChange={item => {
                        handleInputChange("residingCountryCode", item.value);
                      }}
                    />
                  )}
                </View>
              </View>
            </View>

            {/* Third Row */}
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                {renderFormField(
                  "addressStreet",
                  "Address Street",
                  true,
                  "default",
                  regexPatterns.street
                )}
              </View>
              <View style={styles.halfWidth}>
                {renderFormField(
                  "addressZipCode",
                  "Address Zip Code",
                  true,
                  "numeric",
                  /^[0-9]*$/
                )}
              </View>
            </View>

            {/* Fourth Row */}
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                {renderFormField(
                  "addressPostBox",
                  "Address Post Box",
                  false,
                  "numeric",
                  /^[0-9]*$/
                )}
              </View>
              <View style={styles.halfWidth}>
                {renderFormField(
                  "addressDistrict",
                  "Address District",
                  true,
                  "default",
                  regexPatterns.onlyLetters
                )}
              </View>
            </View>

            {/* Fifth Row */}
            <View style={styles.fieldContainer}>
              {renderFormField(
                "addressLocationCoordinates",
                "Address Location Coordinates",
                false,
                "default",
                regexPatterns.coordinates
              )}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handlePrev}
              >
                <Ionicons name="chevron-back" size={20} color="#3B82F6" />
              </TouchableOpacity>

              <View style={styles.centerButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    !isDataChanged && styles.disabledButton
                  ]}
                  onPress={handleSave}
                  disabled={!isDataChanged || saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNext}
              >
                <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      }
    />
  );
};

export default Address;

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  formContainer: { marginBottom: 20 },
  fieldContainer: { marginBottom: 5 },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    flex: 0.48,
  },
  label: { 
    fontSize: 14, 
    fontWeight: "500", 
    marginBottom: 6 
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 11,
    fontSize: 15,
  },
  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  centerButtons: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#6B7280",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    minWidth: 80,
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});