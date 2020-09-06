import React from 'react';
import { Platform, Button } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import TabBarIcon from '../components/TabBarIcon';
// own
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';



const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {},
});



const HomeStack = createStackNavigator({
   Home: {
    screen: HomeScreen
  },
  ProfileScreen: {
    screen: ProfileScreen,
    navigationOptions: {
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        backgroundColor: '#ffffff',
      },
      headerTintColor: '#a1a1a1',
    }
  },
});


//
//
//
//
//
// SHOWING AND HIDING THE TAB BAR HERE
HomeStack.navigationOptions = {
  tabBarLabel: 'All',
  tabBarVisible: true, // if FALSE then hide bar, if TRUE then show bar
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-list${focused ? '' : ''}`
          : 'md-list'
      }
    />
  ),
};



HomeStack.path = '';


const LinksStack = createStackNavigator({
    Links: {
      screen: LinksScreen,
      navigationOptions: {
        header: null,
      },
    },
    ProfileScreen: {
      screen: ProfileScreen,
      navigationOptions: {
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#a1a1a1',
      }
    },
  },
  config
);


LinksStack.navigationOptions = {
  tabBarLabel: 'Dashboard',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-flame' : 'md-flame'} />
  ),
};


LinksStack.path = '';

const SettingsStack = createStackNavigator(
  {
    Settings: SettingsScreen,
  },
  config
);



SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-cog' : 'md-cog'} />
  ),
};

SettingsStack.path = '';


const tabNavigator = createBottomTabNavigator({
  HomeStack,
  LinksStack,
  SettingsStack,
});



// tabNavigator.path = '';

export default tabNavigator;


