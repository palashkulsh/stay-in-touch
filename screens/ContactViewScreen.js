import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, Image, TouchableOpacity, TextInput, FlatList, 
  Alert, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Modal,
  TouchableWithoutFeedback, Keyboard
} from 'react-native';
import * as Linking from 'expo-linking';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';
import RepeatDaysModal from '../components/RepeatDaysModal';
import ContactedModal from '../components/ContactedModal';

const ContactViewScreen = ({ route }) => {
  const { contact } = route.params;
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [repeatDays, setRepeatDays] = useState(0);
  const [lastContactedDate, setLastContactedDate] = useState(null);
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  // New state variables for dialogs
  const [isRepeatDaysModalVisible, setIsRepeatDaysModalVisible] = useState(false);
  const [isContactedModalVisible, setIsContactedModalVisible] = useState(false);
  const [tempRepeatDays, setTempRepeatDays] = useState('');
  const [contactedDate, setContactedDate] = useState(new Date());
  const [contactedNote, setContactedNote] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const noteInputRef = useRef(null);


  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
    
useEffect(() => {
  let isMounted = true;
  const initializeDatabase = async () => {
    try {
      console.log('Initializing database...');
      const database = await SQLite.openDatabaseAsync('contacts.db', { useNewConnection: true });
      if (isMounted) {
        setDb(database);
        await initDatabase(database);
        setIsDatabaseReady(true);
        
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      Alert.alert('Error', 'Failed to initialize the database. Please try again.');
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  initializeDatabase();

  return () => {
    isMounted = false;
    if (db) {
      db.closeAsync();
    }
  };
}, []);

const initDatabase = async (database) => {
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, contactId TEXT, content TEXT, date TEXT);
      CREATE TABLE IF NOT EXISTS contactSettings (id INTEGER PRIMARY KEY AUTOINCREMENT, contactId TEXT, repeatDays INTEGER);
      CREATE TABLE IF NOT EXISTS contacted_on (id INTEGER PRIMARY KEY AUTOINCREMENT, contactId TEXT, contactedDate TEXT);
    `);
    await loadNotes(database);
    await loadContactSettings(database);
    await loadLastContactedDate(database); // Add this line
  } catch (error) {
    console.error('Error in initDatabase:', error);
  }
};

  const loadNotes = async (database) => {
    try {
      console.log('Loading notes for contact:', contact.id);
      const result = await database.getAllAsync('SELECT * FROM notes WHERE contactId = ? ORDER BY date DESC', [contact.id]);
      console.log('Notes loaded:', result);
      setNotes(result);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };    

const loadLastContactedDate = async (database) => {
  if (database) {
    try {
      const result = await database.getFirstAsync(
        'SELECT MAX(contactedDate) as lastContactedDate FROM contacted_on WHERE contactId = ?',
        [contact.id]
      );
      console.log('Contacton loaded:', result);
      if (result && result.lastContactedDate) {
        console.log('Contacton loaded:', result);
        setLastContactedDate(new Date(result.lastContactedDate));
      } else {
        setLastContactedDate(null);
      }
    } catch (error) {
      console.error('Error loading last contacted date:', error);
    }
  }
};

  const loadContactSettings = async (database) => {
    try {
      console.log('Loading contact settings for:', contact.id);
      const result = await database.getFirstAsync('SELECT repeatDays FROM contactSettings WHERE contactId = ?', [contact.id]);
      if (result) {
        console.log('Contact settings loaded:', result);
        setRepeatDays(result.repeatDays);
        setTempRepeatDays(result.repeatDays+'');
      } else {
        console.log('No contact settings found');
      }
    } catch (error) {
      console.error('Error loading contact settings:', error);
    }
  };

  const addNote = async () => {
    if (!isDatabaseReady) {
      Alert.alert('Error', 'Database is not ready. Please try again later.');
      return;
    }

    if (newNote.trim() && db) {
      console.log('Adding new note:', newNote);
      const date = new Date().toISOString();
      try {
        const result = await db.runAsync('INSERT INTO notes (contactId, content, date) VALUES (?, ?, ?)', [contact.id, newNote.trim(), date]);
        console.log('Note added successfully, result:', result);
        if (result.lastInsertRowId) {
          setNotes(prevNotes => [{
            id: result.lastInsertRowId,
            contactId: contact.id,
            content: newNote.trim(),
            date: date
          }, ...prevNotes]);
          setNewNote('');
          console.log('Notes state updated');
        } else {
          console.error('Failed to get insertId after adding note');
        }
      } catch (error) {
        console.error('Error adding note:', error);
        Alert.alert('Error', 'Failed to add note. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please enter a note before adding.');
    }
  };    
    
  const deleteNote = async (noteId) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: async () => {
          if (db) {
            try {
              await db.runAsync('DELETE FROM notes WHERE id = ?', [noteId]);
              setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          }
        }}
      ]
    );
  };

  const editNote = (note) => {
    setEditingNote(note);
    setNewNote(note.content);
  };

  const updateNote = async () => {
    if (!isDatabaseReady || !editingNote) {
      Alert.alert('Error', 'Cannot update note at this time.');
      return;
    }

    if (newNote.trim() && db) {
      try {
        await db.runAsync('UPDATE notes SET content = ?, date = ? WHERE id = ?', [newNote.trim(), new Date().toISOString(), editingNote.id]);
        setNotes(prevNotes => prevNotes.map(note => 
          note.id === editingNote.id 
            ? {...note, content: newNote.trim(), date: new Date().toISOString()} 
            : note
        ));
        setNewNote('');
        setEditingNote(null);
      } catch (error) {
        console.error('Error updating note:', error);
        Alert.alert('Error', 'Failed to update note. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please enter a note before updating.');
    }
  };

  const updateRepeatDays = async (days) => {
    console.log('inside updateRepeatDays')
    if (db) {
      try {
        await db.runAsync(
          'INSERT OR REPLACE INTO contactSettings (contactId, repeatDays, lastContactedDate) VALUES (?, ?, ?)',
          [contact.id, days, lastContactedDate ? lastContactedDate.toISOString() : null]
        );
        setRepeatDays(days);
        Alert.alert('Success', `Repeat days set to ${days}`);
      } catch (error) {
        console.error('Error updating repeat days:', error);
        Alert.alert('Error', 'Failed to update repeat days. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Database is not ready. Please try again later.');
    }
  };

const addContactedEntry = async () => {
  if (db) {
    try {
      // Only add a note if contactedNote is not empty or just whitespace
      if (contactedNote.trim()) {
        await db.runAsync(
          'INSERT INTO notes (contactId, content, date) VALUES (?, ?, ?)',
          [contact.id, contactedNote.trim(), contactedDate.toISOString()]
        );
      }
      
      // Add entry to contacted_on table
      await db.runAsync(
        'INSERT INTO contacted_on (contactId, contactedDate) VALUES (?, ?)',
        [contact.id, contactedDate.toISOString()]
      );
      
      setLastContactedDate(contactedDate);
      loadNotes(db);
      loadLastContactedDate(); // New function to load last contacted date
      Alert.alert('Success', 'Contact entry added successfully');
    } catch (error) {
      console.error('Error adding contacted entry:', error);
      Alert.alert('Error', 'Failed to add contact entry. Please try again.');
    }
  } else {
    Alert.alert('Error', 'Database is not ready. Please try again later.');
  }
};

  const updateLastContactedDate = async () => {
    if (db) {
      const now = new Date();
      try {
        await db.runAsync(
          'INSERT OR REPLACE INTO contactSettings (contactId, repeatDays, lastContactedDate) VALUES (?, ?, ?)',
          [contact.id, repeatDays, now.toISOString()]
        );
        setLastContactedDate(now);
        Alert.alert('Success', 'Marked as contacted today');
      } catch (error) {
        console.error('Error updating last contacted date:', error);
        Alert.alert('Error', 'Failed to update last contacted date. Please try again.');
      }
    }
  };

  const openPhoneApp = useCallback(() => {
    if (contact.phoneNumbers && contact.phoneNumbers[0]) {
      const phoneNumber = contact.phoneNumbers[0].number;
      Linking.openURL(`tel:${phoneNumber}`).catch(err => {
        console.error('Error opening phone app:', err);
        Alert.alert('Error', 'Unable to open phone app');
      });
    } else {
      Alert.alert('Error', 'No phone number available for this contact');
    }
  }, [contact.phoneNumbers]);

  const openWhatsApp = useCallback(() => {
    if (contact.phoneNumbers && contact.phoneNumbers[0]) {
      const phoneNumber = contact.phoneNumbers[0].number;
      Linking.openURL(`whatsapp://send?phone=${phoneNumber}`).catch(err => {
        console.error('Error opening WhatsApp:', err);
        Alert.alert('Error', 'Unable to open WhatsApp. Make sure it is installed on your device.');
      });
    } else {
      Alert.alert('Error', 'No phone number available for this contact');
    }
  }, [contact.phoneNumbers]);

  const exportNotes = async () => {
    const notesText = notes.map(note => 
      `Date: ${new Date(note.date).toLocaleString()}\n${note.content}\n\n`
    ).join('');
    
    const fileUri = FileSystem.documentDirectory + 'notes.txt';
    try {
      await FileSystem.writeAsStringAsync(fileUri, notesText);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error exporting notes:', error);
      Alert.alert('Error', 'Failed to export notes. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

    
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{contact.name}</Text>
        {contact.imageAvailable && contact.image && contact.image.uri && (
          <Image source={{ uri: contact.image.uri }} style={styles.image} />
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={openPhoneApp}>
          <Ionicons name="call" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={openWhatsApp}>
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
        </TouchableOpacity>
      </View>

      <View style={styles.notesSection}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={styles.addNoteContainer}>
          <TextInput
            style={styles.input}
            value={newNote}
            onChangeText={setNewNote}
            placeholder={editingNote ? "Edit note" : "Add a note"}
            multiline={true}
            numberOfLines={3}
          />
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={editingNote ? updateNote : addNote}
          >
            <Ionicons name={editingNote ? "checkmark" : "add"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.noteItem}>
              <Text style={styles.noteContent}>{item.content}</Text>
              <Text style={styles.noteDate}>{new Date(item.date).toLocaleString()}</Text>
              <View style={styles.noteActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => editNote(item)}>
                  <Ionicons name="create-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteNote(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>


      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={() => setIsRepeatDaysModalVisible(true)}
        >
          <Ionicons name="calendar-outline" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={() => setIsContactedModalVisible(true)}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#4CD964" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton} onPress={exportNotes}>
          <Ionicons name="share-outline" size={24} color="#FF9500" />
        </TouchableOpacity>
      </View>

	<RepeatDaysModal
        isVisible={isRepeatDaysModalVisible}
        setIsVisible={setIsRepeatDaysModalVisible}
        tempRepeatDays={tempRepeatDays  || repeatDays}
        setTempRepeatDays={setTempRepeatDays}
        updateRepeatDays={updateRepeatDays}
        contactName={contact.name}
      />

      <ContactedModal
        isVisible={isContactedModalVisible}
        setIsVisible={setIsContactedModalVisible}
        contactedDate={contactedDate}
        setContactedDate={setContactedDate}
        contactedNote={contactedNote}
        setContactedNote={setContactedNote}
        addContactedEntry={addContactedEntry}
        isKeyboardVisible={isKeyboardVisible}
        isDatePickerVisible={isDatePickerVisible}
        setDatePickerVisibility={setDatePickerVisibility}
        isTimePickerVisible={isTimePickerVisible}
        setTimePickerVisibility={setTimePickerVisibility}
      />
	
      {lastContactedDate && repeatDays > 0 && (
        <Text style={styles.lastContactedText}>
          {new Date() - lastContactedDate > repeatDays * 86400000 
            ? `Last contacted more than ${repeatDays} days ago`
            : `Last contacted ${Math.floor((new Date() - lastContactedDate) / 86400000)} days ago`}
        </Text>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  noteActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 5,
    marginRight: 5,
  },    
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e1e1e1',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  actionButton: {
    padding: 10,
    marginHorizontal: 20,
  },
  notesSection: {
    flex: 1,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addNoteContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  noteItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteContent: {
    flex: 1,
    fontSize: 16,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerButton: {
    padding: 10,
  },
  lastContactedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default ContactViewScreen;
