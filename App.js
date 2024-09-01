// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import ContactListScreen from './screens/ContactListScreen';
import RepeatContactListScreen from './screens/RepeatContactListScreen';
import ContactViewScreen from './screens/ContactViewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ContactStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ContactList" component={ContactListScreen} options={{ title: 'Contacts' }} />
    <Stack.Screen name="ContactView" component={ContactViewScreen} options={{ title: 'Contact Details' }} />
  </Stack.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Contacts" component={ContactStack} />
        <Tab.Screen name="Repeat Contacts" component={RepeatContactListScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;