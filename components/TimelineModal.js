import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TimelineModal = ({ isVisible, setIsVisible, timelineData }) => {
  const renderTimelineItem = ({ item }) => (
    <View style={styles.timelineItem}>
      <View style={styles.timelineDot} />
      <View style={styles.timelineContent}>
        <Text style={styles.timelineDate}>{new Date(item.contactedDate).toLocaleString()}</Text>
        {item.note && <Text style={styles.timelineNote}>{item.note}</Text>}
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsVisible(false)}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Contact Timeline</Text>
          <FlatList
            data={timelineData}
            renderItem={renderTimelineItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.timelineList}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  timelineList: {
    paddingVertical: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginRight: 10,
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timelineNote: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default TimelineModal;
