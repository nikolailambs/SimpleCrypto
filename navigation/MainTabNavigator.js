import React from 'react';
import { Platform, Button } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import TabBarIcon from '../components/TabBarIcon';
// own
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

import DashboardScreen from '../screens/DashboardScreen';
import SearchScreen from '../screens/SearchScreen';



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
        backgroundColor: '#f8f8f8',
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


const DashboardStack = createStackNavigator({
    Dashboard: {
      screen: DashboardScreen,
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
          backgroundColor: '#f8f8f8',
        },
        headerTintColor: '#a1a1a1',
      }
    },
  },
  config
);


DashboardStack.navigationOptions = {
  tabBarLabel: 'Dashboard',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-flame' : 'md-flame'} />
  ),
};


DashboardStack.path = '';

const SearchStack = createStackNavigator({
    Search: {
      screen: SearchScreen,
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
          backgroundColor: '#f8f8f8',
        },
        headerTintColor: '#a1a1a1',
      }
    },
  },
  config
);



SearchStack.navigationOptions = {
  tabBarLabel: 'Search',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-search' : 'md-search'} />
  ),
};

SearchStack.path = '';


const tabNavigator = createBottomTabNavigator({
  DashboardStack,
  HomeStack,
  SearchStack,
},
{
  animationEnabled: true,
  tabBarPosition: 'bottom',
  tabBarOptions: {
    // showLabel: false,
    style:{
      shadowColor: 'rgba(58,55,55,0.3)',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 15,
      borderTopColor: 'transparent',
      borderRadius: 20,
      height: 60,
      backgroundColor: '#ffffff',
      borderTopWidth: 0,
      position: 'absolute',
      left: 10,
      right: 10,
      bottom: 10,
    },
    activeTabStyle: {
      backgroundColor: 'white',
    }
  }
});



// tabNavigator.path = '';

export default tabNavigator;


