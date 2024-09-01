import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform,StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const ContactedModal = ({ 
  isVisible, 
  setIsVisible, 
  contactedDate, 
  setContactedDate, 
  contactedNote, 
  setContactedNote, 
  addContactedEntry, 
  isKeyboardVisible,
  isDatePickerVisible,
  setDatePickerVisibility,
  isTimePickerVisible,
  setTimePickerVisibility
}) => {
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const handleDateConfirm = (event, selectedDate) => {
    const currentDate = selectedDate || contactedDate;
    hideDatePicker();
    setContactedDate(currentDate);
  };

  const handleTimeConfirm = (event, selectedTime) => {
    const currentTime = selectedTime || contactedDate;
    hideTimePicker();
    setContactedDate(currentTime);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centeredView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <View style={[styles.modalView, isKeyboardVisible && styles.modalViewWithKeyboard]}>
            <Text style={styles.modalText}>Mark Contacted</Text>
            
            <TouchableOpacity onPress={showDatePicker} style={styles.dateTimeButton}>
              <Text>{contactedDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={showTimePicker} style={styles.dateTimeButton}>
              <Text>{contactedDate.toLocaleTimeString()}</Text>
            </TouchableOpacity>

            {isDatePickerVisible && (
              <DateTimePicker
                value={contactedDate}
                mode="date"
                display="default"
                onChange={handleDateConfirm}
              />
            )}

            {isTimePickerVisible && (
              <DateTimePicker
                value={contactedDate}
                mode="time"
                display="default"
                onChange={handleTimeConfirm}
              />
            )}

            <TextInput
              style={[styles.modalInput, styles.noteInput]}
              onChangeText={setContactedNote}
              value={contactedNote}
              placeholder="Add a note"
              multiline={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => {
                  setIsVisible(false);
                  setContactedNote('');
                }}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSubmit]}
                onPress={() => {
                  addContactedEntry();
                  setIsVisible(false);
                  setContactedNote('');
                }}
              >
                <Text style={styles.textStyle}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  modalInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '100%'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonSubmit: {
    backgroundColor: "#2196F3",
  },
  buttonCancel: {
    backgroundColor: "#F194FF",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  dateTimeButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
 centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalViewWithKeyboard: {
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  noteInput: {
    height: 100,
    textAlignVertical: 'top',
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
});


export default ContactedModal;
