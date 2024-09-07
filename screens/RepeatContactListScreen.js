import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Text, Switch, StyleSheet, Alert, ToastAndroid } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Contacts from 'expo-contacts';
import { useFocusEffect } from '@react-navigation/native';

const RepeatContactListScreen = ({ navigation }) => {
    const [repeatContacts, setRepeatContacts] = useState([]);
    const [showRipeOnly, setShowRipeOnly] = useState(true);
    const [db, setDb] = useState(null);

    useEffect(() => {
        const initDatabase = async () => {
            const database = await SQLite.openDatabaseAsync('contacts.db', { useNewConnection: true });
            setDb(database);
        };
        initDatabase();
    }, []);

    const loadRepeatContacts = useCallback(async () => {
        if (!db) return;

        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
		// checking if table exists
		let table_existence = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='contactSettings'");
		if(!table_existence || !table_existence.length){
		    // if contactSettings table does not exist then exit without going further.
		    ToastAndroid.show('No active repeat contacts', ToastAndroid.SHORT);
		    return;
		}
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.ID, Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
                });
                let rows = await db.getAllAsync(
                    `SELECT cs.contactId, cs.repeatDays, co.contactedDate 
                     FROM contactSettings cs
                     LEFT JOIN (
                       SELECT contactId, MAX(contactedDate) as contactedDate
                       FROM contacted_on
                       GROUP BY contactId
                     ) co ON cs.contactId = co.contactId
                     WHERE cs.repeatDays > 0`,
                    []
                );
                const settings = rows;
                const contactsWithSettings = data.filter(contact => 
                    settings.some(setting => setting.contactId === contact.id)
                ).map(contact => {
                    const setting = settings.find(s => s.contactId === contact.id);
                    return { 
                        ...contact, 
                        repeatDays: setting.repeatDays,
                        lastContactedDate: setting.contactedDate ? new Date(setting.contactedDate) : null
                    };
                });
                setRepeatContacts(contactsWithSettings);
            }
        } catch (error) {
            console.error('Error loading repeat contacts:', error);
            Alert.alert('Error', 'Failed to load repeat contacts. Please try again.');
        }
    }, [db]);

    useFocusEffect(
        useCallback(() => {
            console.log("Screen is focused, reloading contacts");
            loadRepeatContacts();
        }, [loadRepeatContacts])
    );

    const filteredContacts = showRipeOnly
        ? repeatContacts.filter(contact => 
            !contact.lastContactedDate || 
            (new Date() - contact.lastContactedDate > contact.repeatDays * 86400000))
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
                            {item.lastContactedDate 
                                ? `Last contacted ${Math.floor((new Date() - item.lastContactedDate) / 86400000)} days ago`
                                : 'Never contacted'}
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
