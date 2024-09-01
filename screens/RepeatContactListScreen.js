import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, Switch, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Contacts from 'expo-contacts';



const RepeatContactListScreen = async ({ navigation }) => {
  const [repeatContacts, setRepeatContacts] = useState([]);
  const [showRipeOnly, setShowRipeOnly] = useState(true);

  useEffect(() => {
    initDatabase();
    loadRepeatContacts();
  }, []);

  const initDatabase = async () => {
    const db = await SQLite.openDatabaseAsync('contacts.db');
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS contactSettings (id INTEGER PRIMARY KEY AUTOINCREMENT, contactId TEXT, repeatDays INTEGER, lastContactedDate TEXT)'
      );
    });
  };

  const loadRepeatContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.ID, Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        db.transaction(tx => {
          tx.executeSql(
            `SELECT cs.contactId, cs.repeatDays, cs.lastContactedDate 
             FROM contactSettings cs
             WHERE cs.repeatDays > 0`,
            [],
            (_, { rows }) => {
              const settings = rows._array;
              const contactsWithSettings = data.filter(contact => 
                settings.some(setting => setting.contactId === contact.id)
              ).map(contact => {
                const setting = settings.find(s => s.contactId === contact.id);
                return { ...contact, ...setting };
              });
              setRepeatContacts(contactsWithSettings);
            }
          );
        });
      }
    } catch (error) {
      console.error('Error loading repeat contacts:', error);
    }
  };

  const filteredContacts = showRipeOnly
    ? repeatContacts.filter(contact => 
        new Date() - new Date(contact.lastContactedDate) > contact.repeatDays * 86400000)
    : repeatContacts;

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <Text>Show only ripe contacts</Text>
        <Switch
          value={showRipeOnly}
          onValueChange={setShowRipeOnly}
        />
      </View>
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => navigation.navigate('ContactView', { contact: item })}
          >
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.lastContacted}>
              Last contacted {Math.floor((new Date() - new Date(item.lastContactedDate)) / 86400000)} days ago
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastContacted: {
    fontSize: 12,
    color: 'grey',
  },
});

export default RepeatContactListScreen;