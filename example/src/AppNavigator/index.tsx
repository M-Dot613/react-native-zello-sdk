import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import UsersScreen from '../HomeTabs/UsersScreen';
import ChannelsScreen from '../HomeTabs/ChannelsScreen';
import RecentsScreen from '../HomeTabs/RecentsScreen';
import GroupConversationsScreen from '../GroupConversationsScreen';
import MinimalChannelScreen from '../MinimalChannelScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Recents') {
            iconName = 'time-outline';
          } else if (route.name === 'Users') {
            iconName = 'person';
          } else if (route.name === 'Channels') {
            iconName = 'people';
          } else if (route.name === 'Group Conversations') {
            iconName = 'chatbubbles';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ef5e14',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Recents" component={RecentsScreen} />
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Channels" component={ChannelsScreen} />
      <Tab.Screen
        name="Group Conversations"
        component={GroupConversationsScreen}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="index"
          component={MinimalChannelScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return <AppNavigator />;
}
