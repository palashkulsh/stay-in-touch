import React from 'react';
import { View, Button} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';

import ContactListScreen from './screens/ContactListScreen';
import RepeatContactListScreen from './screens/RepeatContactListScreen';
import ContactViewScreen from './screens/ContactViewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ContactStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false, // This will hide the header for all screens in this stack
    }}
  >
    <Stack.Screen name="ContactList" component={ContactListScreen} />
    <Stack.Screen name="ContactView" component={ContactViewScreen} />
  </Stack.Navigator>
);

const exportDatabase = async () => {
  const dbName = 'contacts.db';
  const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;
  
  try {
    if (await FileSystem.getInfoAsync(dbPath)) {
      const destinationUri = FileSystem.documentDirectory + dbName;
      await FileSystem.copyAsync({
        from: dbPath,
        to: destinationUri
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(destinationUri);
      } else {
        alert("Sharing is not available on this device");
      }
    } else {
      alert("Database file not found");
    }
  } catch (error) {
    console.error("Error exporting database:", error);
    alert("Failed to export database");
  }
};

const importDatabase = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/octet-stream' });
    
    if (result.type === 'success') {
      const dbName = 'contacts.db';
      const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;
      
      await FileSystem.copyAsync({
        from: result.uri,
        to: dbPath
      });
      
      // Close and reopen the database to apply changes
      const db = SQLite.openDatabase(dbName);
      db.closeAsync();
      SQLite.openDatabase(dbName);
      
      alert("Database imported successfully");
    }
  } catch (error) {
    console.error("Error importing database:", error);
    alert("Failed to import database");
  }
};

const SettingsScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Export Database" onPress={exportDatabase} />
      <Button title="Import Database" onPress={importDatabase} />
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Contacts') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Repeat Contacts') {
              iconName = focused ? 'repeat' : 'repeat-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
	tabBarShowLabel: false, // This will hide the tab labels
	headerShown: false, // This will hide the header for all tabs	      
        })}
      >
        <Tab.Screen name="Contacts" component={ContactStack} />
        <Tab.Screen name="Repeat Contacts" component={RepeatContactListScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
