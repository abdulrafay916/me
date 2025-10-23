import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import useTranslationWithPrefix from "hooks/useTranslationWithPrefix";
import { selectForm, updateForm } from "redux/slices/formSlice";
import {
  getCustomerCategory,
  getCustomerPrimaryId,
  getCustomerResidentType,
  removeUserProfile,
} from "helpers/AuthUtils";
import KycEntryLayout from "../KycEntryLayout";
import paths from "routes/paths";
import useDisableNavigation from "hooks/useDisableNavigation";
import { getCountryName, getErrorMessage } from "helpers/AppUtil";
import { toast } from "react-toastify";
import {
  CORPORATE,
  EXPATRIATE_RESIDENT,
  IDENTITY,
  INDIVIDUAL,
  NONRESIDENT,
  SAUDI_RESIDENT,
} from "constant/constant";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import {
  getCustomerLeadById,
  updateCustomerLeadInformation,
} from "redux/slices/customerLeadSlice";
import { customerLeadInfo } from "helpers/customerLeadUtil";
import {
  getAllCountryListForKyc,
  selectCountry,
} from "redux/slices/countrySlice";
import { format } from "date-fns-tz";
import { regexPatterns } from "helpers/utils";

const Identity = () => {
  const navigation = useNavigation();
  const isKycUpdate = false; // You may need to adjust this based on your navigation state
  const customerCategory = getCustomerCategory();
  const id = getCustomerPrimaryId();
  const residentType = getCustomerResidentType();
  const isIndiviual = customerCategory === INDIVIDUAL;
  const isCorporate = customerCategory === CORPORATE;
  const isSaudiResident =
    customerCategory === INDIVIDUAL && residentType === SAUDI_RESIDENT;
  const isExpatriateResident =
    customerCategory === INDIVIDUAL && residentType === EXPATRIATE_RESIDENT;

  const isResident = isSaudiResident || isExpatriateResident;
  const isNonResident =
    customerCategory === INDIVIDUAL && residentType === NONRESIDENT;

  const { t: labels } = useTranslationWithPrefix("identity");
  const { t: commonLabels } = useTranslationWithPrefix("common.labels");
  const { t: cm } = useTranslationWithPrefix("common.message");
  const { t: buttons } = useTranslationWithPrefix("buttons");
  useDisableNavigation();
  const formData = useSelector(selectForm);
  const dispatch = useDispatch();
  const countries = useSelector(selectCountry);
  const [initialValues, setInitialValues] = useState({});
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [isSavedAfterChange, setIsSavedAfterChange] = useState(true);
  const [isBasicDetailsEntered, setIsBasicDetailsEntered] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState({
    idIssueDate: false,
    birthDate: false,
    inCorpDate: false,
    idExpiryDate: false,
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const res = await dispatch(
          getCustomerLeadById(`${id}/${IDENTITY}`)
        ).unwrap();

        if (res.status.status === 200) {
          dispatch(updateForm(res.data));
          setInitialValues(res.data);
          setIsBasicDetailsEntered(res.data.isBasicDetailsEntered);
        }
      } catch (error) {
        if (error.status.status !== 400) {
          Alert.alert("Error", getErrorMessage(error));
        }
      }
    };
    {
      !isKycUpdate && fetchCustomerData();
    }
  }, [dispatch]);

  const identityFields = customerLeadInfo.identity;

  const data = { id };

  identityFields.forEach((field) => {
    data[field] = formData[field];
  });

  const countryOptions = (countries ?? []).map((countries) => {
    const { countryId, countryName } = countries;
    return {
      value: countryId ?? commonLabels("notAvailable"),
      label: countryName ?? commonLabels("notAvailable"),
      displayLabel: countryName ?? commonLabels("notAvailable"),
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getAllCountryListForKyc()).unwrap();
      } catch (error) {
        if (error.status.status !== 400) {
          Alert.alert("Error", getErrorMessage(error));
        }
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (value, fieldName) => {
    if (fieldName) {
      dispatch(updateForm({ [fieldName]: value }));
    }
  };

  const handleCancelClick = () => {
    navigation.navigate(paths.loginPage);
    removeUserProfile();
  };

  useEffect(() => {
    if (Object.keys(initialValues).length === 0) return;

    const changed = identityFields.some((field) => {
      return initialValues[field] !== formData[field];
    });

    setIsDataChanged(changed);

    if (changed) {
      setIsSavedAfterChange(false);
    }
  }, [formData, initialValues]);

  const handleSaveData = async (showToast = true) => {
    try {
      const res = await dispatch(
        updateCustomerLeadInformation({ id, key: IDENTITY, data })
      ).unwrap();

      if (res.status.status === 200) {
        setInitialValues({ ...formData });
        setIsSavedAfterChange(true);

        if (showToast) {
          Alert.alert("Success", cm("save"));
        }
      }
      return true;
    } catch (error) {
      if (error.status.status !== 400) {
        Alert.alert("Error", getErrorMessage(error));
      }
      return false;
    }
  };

  const handleSaveClick = async () => {
    await handleSaveData(true);
  };

  const handleNextClick = async () => {
    if (isDataChanged && !isSavedAfterChange) {
      const success = await handleSaveData(false);
      if (!success) return;
    }
    navigation.navigate(paths.address);
  };

  const handleDateChange = (event, selectedDate, fieldName) => {
    setShowDatePicker({ ...showDatePicker, [fieldName]: false });
    if (selectedDate) {
      handleInputChange(selectedDate, fieldName);
    }
  };

  const showDatePickerModal = (fieldName) => {
    setShowDatePicker({ ...showDatePicker, [fieldName]: true });
  };

  const renderDateField = (fieldName, label, isRequired = false) => {
    const value = formData[fieldName];
    const formattedValue = value ? format(value, "dd-MM-yyyy") : "";

    return (
      <View className="mb-4">
        <Text className="text-gray-700 text-sm font-medium mb-2">
          {label}
          {isRequired && <Text className="text-red-500"> *</Text>}
        </Text>
        {isBasicDetailsEntered ? (
          <TextInput
            value={formattedValue}
            editable={false}
            className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-100 text-gray-500"
          />
        ) : (
          <TouchableOpacity
            onPress={() => showDatePickerModal(fieldName)}
            className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
          >
            <Text className="text-gray-900">
              {formattedValue || "Select Date"}
            </Text>
          </TouchableOpacity>
        )}
        {showDatePicker[fieldName] && (
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) =>
              handleDateChange(event, selectedDate, fieldName)
            }
          />
        )}
      </View>
    );
  };

  const renderIdentityForm = () => {
    return (
      <ScrollView className="flex-1 bg-white">
        <View className="p-4">
          {/* ID Type */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              {labels("idType")}
            </Text>
            <TextInput
              value={
                isResident
                  ? labels("NIN")
                  : isNonResident
                  ? labels("PassportNo")
                  : isCorporate
                  ? labels("crNo")
                  : ""
              }
              editable={false}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-100 text-gray-500"
            />
          </View>

          {/* ID Number */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              {labels("idNumber")}
            </Text>
            <TextInput
              value={
                isResident
                  ? formData.nationalId
                  : isNonResident
                  ? formData.passportNumber
                  : isCorporate
                  ? formData.crNum
                  : ""
              }
              editable={false}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-100 text-gray-500"
            />
          </View>

          {/* Customer Name */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              {labels("customerName")}
              <Text className="text-red-500"> *</Text>
            </Text>
            <TextInput
              value={formData.customerName}
              editable={!isBasicDetailsEntered}
              onChangeText={(text) => {
                const regex = /^[A-Za-z\s.]*$/;
                if (regex.test(text)) {
                  handleInputChange(text, "customerName");
                }
              }}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="Enter customer name"
            />
          </View>

          {/* Customer Name Arabic */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              {labels("customerNameAr")}
              <Text className="text-red-500"> *</Text>
            </Text>
            <TextInput
              value={formData.customerNameAr}
              editable={!isBasicDetailsEntered}
              onChangeText={(text) => {
                const onlyArabic = text.replace(/[^\u0600-\u06FF\s]/g, "");
                handleInputChange(onlyArabic, "customerNameAr");
              }}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white text-right"
              placeholder="أدخل اسم العميل"
            />
          </View>

          {/* ID Issue Date */}
          {renderDateField("idIssueDate", labels("idIssueDate"), true)}

          {/* Birth Date (Individual only) */}
          {isIndiviual &&
            renderDateField("birthDate", labels("birthDate"), true)}

          {/* Incorporation Date (Corporate only) */}
          {isCorporate &&
            renderDateField("inCorpDate", labels("incorpDate"), true)}

          {/* ID Expiry Date */}
          {renderDateField("idExpiryDate", labels("idExpiryDate"), true)}

          {/* ID Issue Place */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              {labels("idIssuePlace")}
              <Text className="text-red-500"> *</Text>
            </Text>
            {isBasicDetailsEntered ? (
              <TextInput
                value={getCountryName(countries, formData.idIssuePlace)}
                editable={false}
                className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-100 text-gray-500"
              />
            ) : (
              <View className="border border-gray-300 rounded-lg bg-white">
                <Picker
                  selectedValue={formData.idIssuePlace}
                  onValueChange={(value) => handleInputChange(value, "idIssuePlace")}
                >
                  <Picker.Item label="Select Country" value="" />
                  {countryOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="p-4 bg-gray-50 border-t border-gray-200">
          <View className="flex-row justify-center gap-3 mb-4">
            <TouchableOpacity
              onPress={handleCancelClick}
              className="bg-gray-500 px-6 py-3 rounded-lg min-w-[80px]"
            >
              <Text className="text-white text-center font-medium">
                {buttons("cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveClick}
              disabled={!isDataChanged}
              className={`px-6 py-3 rounded-lg min-w-[80px] ${
                isDataChanged ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-center font-medium">
                {buttons("save")}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="items-end">
            <TouchableOpacity
              onPress={handleNextClick}
              className="bg-blue-500 w-12 h-12 rounded-full items-center justify-center"
            >
              <FontAwesomeIcon icon={faAngleDoubleRight} color="white" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <KycEntryLayout
      step={1}
      barPages={10}
      barPercentage={(1 / 10) * 100}
      split
      leftHeading={labels("identity")}
      leftBody={labels("asPartOfKYCProcedures")}
      rightContent={renderIdentityForm()}
    />
  );
};

export default Identity;