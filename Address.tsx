import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import useTranslationWithPrefix from "hooks/useTranslationWithPrefix";
import {
  getCustomerLeadById,
  updateCustomerLeadInformation,
} from "redux/slices/customerLeadSlice";
import { selectForm, updateForm } from "redux/slices/formSlice";
import { customerLeadInfo } from "helpers/customerLeadUtil";
import paths from "routes/paths";
import KycEntryLayout from "../KycEntryLayout";
import {
  getCustomerCategory,
  getCustomerPrimaryId,
  removeUserProfile,
} from "helpers/AuthUtils";
import { getCountryName, getErrorMessage } from "helpers/AppUtil";
import {
  getAllCountryListForKyc,
  selectCountry,
} from "redux/slices/countrySlice";
import CustomAutoSelect from "components/CustomAutoSelect/CustomAutoSelect";
import { ADDRESS, CORPORATE } from "constant/constant";
import { regexPatterns } from "helpers/utils";
import { Ionicons } from "@expo/vector-icons";

const Address = () => {
  const { t: labels } = useTranslationWithPrefix("address");
  const { t: cm } = useTranslationWithPrefix("common.message");
  const customerCategory = getCustomerCategory();

  const isCorporate = customerCategory === CORPORATE;

  const { t: commonLabels } = useTranslationWithPrefix("common.labels");
  const { t: buttons } = useTranslationWithPrefix("buttons");
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const formData = useSelector(selectForm);
  const countries = useSelector(selectCountry);

  const [initialValues, setInitialValues] = useState({});
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [isSavedAfterChange, setIsSavedAfterChange] = useState(true);
  const [isAddressDetailsEntered, setIsAddressDetailsEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addressFields = customerLeadInfo.address;
  const id = getCustomerPrimaryId();
  const data = { id };

  addressFields.forEach((field) => {
    data[field] = formData[field];
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    Alert.alert(
      type === 'success' ? 'Success' : 'Error',
      message,
      [{ text: 'OK' }]
    );
  };

  const handleSaveData = async (showToast = true) => {
    try {
      setIsLoading(true);
      const res = await dispatch(
        updateCustomerLeadInformation({ id, key: ADDRESS, data })
      ).unwrap();

      if (res.status.status === 200) {
        setInitialValues({ ...formData });
        setIsSavedAfterChange(true);

        if (showToast) {
          showToast(cm("save"), 'success');
        }
      }
      return true; // success
    } catch (error) {
      if (error.status.status !== 400) {
        showToast(getErrorMessage(error), 'error');
      }
      return false; // failure
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClick = async () => {
    await handleSaveData(true);
  };

  const countryOptions = (countries ?? []).map((countries) => {
    const { countryId, countryName } = countries;
    return {
      value: countryId ?? commonLabels("notAvailable"),
      label: countryName ?? commonLabels("notAvailable"),
      displayLabel: countryName ?? commonLabels("notAvailable"),
    };
  });

  const handleInputChange = (e: any, fieldName = "") => {
    let name = fieldName;
    let value = "";

    if (e?.target) {
      name = e.target.name || fieldName;
      value = e.target.value;
    } else if (e instanceof Date || typeof e === "string") {
      value = e;
    } else {
      value = e?.value ?? "";
    }

    if (name) {
      dispatch(updateForm({ [name]: value }));
    }
  };

  const handleNextClick = async () => {
    if (isDataChanged && !isSavedAfterChange) {
      const success = await handleSaveData(false);
      if (!success) return;
    }

    navigation.navigate(isCorporate ? paths.business : paths.personal);
  };

  const handlePrevClick = async () => {
    if (isDataChanged && !isSavedAfterChange) {
      const success = await handleSaveData(false);
      if (!success) return;
    }

    navigation.navigate(paths.identity);
  };

  const handleCancelClick = () => {
    navigation.navigate(paths.loginPage);
    removeUserProfile();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getAllCountryListForKyc()).unwrap();
      } catch (error) {
        if (error.status.status !== 400) {
          showToast(getErrorMessage(error), 'error');
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const res = await dispatch(
          getCustomerLeadById(`${id}/${ADDRESS}`)
        ).unwrap();

        if (res.status.status === 200) {
          dispatch(updateForm(res.data));
          setInitialValues(res.data);
          setIsAddressDetailsEntered(res.data.isAddressEntered);
        }
      } catch (error) {
        if (error.status.status !== 400) {
          showToast(getErrorMessage(error), 'error');
        }
      }
    };

    fetchCustomerData();
  }, [dispatch]);

  useEffect(() => {
    if (Object.keys(initialValues).length === 0) return;

    const changed = addressFields.some((field) => {
      return initialValues[field] !== formData[field];
    });

    setIsDataChanged(changed);

    if (changed) {
      setIsSavedAfterChange(false);
    }
  }, [formData, initialValues]);

  const renderFormField = (
    fieldName: string,
    label: string,
    isRequired: boolean = false,
    keyboardType: any = "default",
    validationPattern?: RegExp
  ) => {
    return (
      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-medium mb-2">
          {label}
          {isRequired && <Text className="text-error-500"> *</Text>}
        </Text>
        <TextInput
          className={`border rounded-lg px-4 py-3 text-gray-900 ${
            isAddressDetailsEntered 
              ? 'border-gray-200 bg-gray-100' 
              : 'border-gray-300 bg-white'
          }`}
          value={formData[fieldName] || ""}
          editable={!isAddressDetailsEntered}
          keyboardType={keyboardType}
          onChangeText={(text) => {
            if (!validationPattern || validationPattern.test(text)) {
              handleInputChange({ target: { name: fieldName, value: text } });
            }
          }}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    );
  };

  const renderAddressForm = () => {
    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* First Row */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              {renderFormField(
                "addressBuilding",
                labels("addressBuilding"),
                true,
                "default",
                regexPatterns.addressBuilding
              )}
            </View>
            <View className="flex-1 ml-2">
              {renderFormField(
                "addressCity",
                labels("addressCity"),
                true,
                "default",
                regexPatterns.onlyLetters
              )}
            </View>
          </View>

          {/* Second Row */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              {renderFormField(
                "addressUnitNumber",
                labels("addressUnitNumber"),
                true,
                "default",
                regexPatterns.alphaNumeric
              )}
            </View>
            <View className="flex-1 ml-2">
              <View className="mb-4">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  {labels("residingCountryCode")}
                  <Text className="text-red-500"> *</Text>
                </Text>
                {isAddressDetailsEntered ? (
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-100"
                    value={getCountryName(countries, formData.residingCountryCode)}
                    editable={false}
                  />
                ) : (
                  <CustomAutoSelect
                    options={countryOptions}
                    value={formData.residingCountryCode}
                    onChange={(e) => handleInputChange(e, "residingCountryCode")}
                    name="residingCountryCode"
                  />
                )}
              </View>
            </View>
          </View>

          {/* Third Row */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              {renderFormField(
                "addressStreet",
                labels("addressStreet"),
                true,
                "default",
                regexPatterns.street
              )}
            </View>
            <View className="flex-1 ml-2">
              {renderFormField(
                "addressZipCode",
                labels("addressZipCode"),
                true,
                "numeric",
                /^[0-9]*$/
              )}
            </View>
          </View>

          {/* Fourth Row */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              {renderFormField(
                "addressPostBox",
                labels("addressPostBox"),
                false,
                "numeric",
                /^[0-9]*$/
              )}
            </View>
            <View className="flex-1 ml-2">
              {renderFormField(
                "addressDistrict",
                labels("addressDistrict"),
                true,
                "default",
                regexPatterns.onlyLetters
              )}
            </View>
          </View>

          {/* Fifth Row */}
          <View className="mb-4">
            {renderFormField(
              "addressLocationCoordinates",
              labels("addressLocationCoordinates"),
              false,
              "default",
              regexPatterns.coordinates
            )}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="px-4 py-6 border-t border-gray-200">
          <View className="flex-row items-center justify-between">
            {/* Previous Button */}
            <TouchableOpacity
              className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
              onPress={handlePrevClick}
            >
              <Ionicons name="chevron-back" size={20} color="white" />
            </TouchableOpacity>

            {/* Center Buttons */}
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity
                className="bg-gray-500 px-6 py-3 rounded-lg"
                onPress={handleCancelClick}
              >
                <Text className="text-white font-medium">{buttons("cancel")}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`px-6 py-3 rounded-lg ${
                  !isDataChanged ? "bg-gray-300" : "bg-green-500"
                }`}
                onPress={handleSaveClick}
                disabled={!isDataChanged || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-medium">{buttons("save")}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Next Button */}
            <TouchableOpacity
              className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
              onPress={handleNextClick}
            >
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <KycEntryLayout
      step={2}
      topHeading={commonLabels("verify")}
      barPages={10}
      barPercentage={(2 / 10) * 100}
      split
      leftHeading={labels("address")}
      leftBody={labels("asPartOfKYCProcedures")}
      rightContent={renderAddressForm()}
    />
  );
};

export default Address;