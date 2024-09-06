import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, TouchableWithoutFeedback, Keyboard, StyleSheet, Alert } from 'react-native';

const RepeatDaysModal = ({ isVisible, setIsVisible, tempRepeatDays, setTempRepeatDays, updateRepeatDays, deleteRepeatDays, contactName }) => {
    return (
	<Modal
	    animationType="slide"
	    transparent={true}
	    visible={isVisible}
	    onRequestClose={() => setIsVisible(false)}
	>
	    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
		<View style={styles.centeredView}>
		    <View style={styles.modalView}>
			<Text style={styles.modalText}>Contact {contactName} every</Text>
			<TextInput
			    style={styles.modalInput}
			    onChangeText={setTempRepeatDays}
			    value={tempRepeatDays}
			    keyboardType="numeric"
			    placeholder="Enter days"
			/>
			<Text style={styles.modalText}>days</Text>
			<View style={styles.modalButtons}>
			    <TouchableOpacity
				style={[styles.button, styles.buttonCancel]}
				onPress={() => setIsVisible(false)}
			    >
				<Text style={styles.textStyle}>Cancel</Text>
			    </TouchableOpacity>
			    <TouchableOpacity
				style={[styles.button, styles.buttonDelete]}
				onPress={() => {
				    deleteRepeatDays();
				    setIsVisible(false);
				}}
			    >
				<Text style={styles.textStyle}>Remove</Text>
			    </TouchableOpacity>
			    <TouchableOpacity
				style={[styles.button, styles.buttonSubmit]}
				onPress={() => {
				    const days = parseInt(tempRepeatDays);
				    if (isNaN(days) || days < 1) {
					Alert.alert('Error', 'Please enter a valid number of days.');
				    } else {
					updateRepeatDays(days);
					setIsVisible(false);
				    }
				}}
			    >
				<Text style={styles.textStyle}>Submit</Text>
			    </TouchableOpacity>
			</View>
		    </View>
		</View>
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
    buttonDelete: {
	backgroundColor: "#FF3B30",
    },    
});

export default RepeatDaysModal;

