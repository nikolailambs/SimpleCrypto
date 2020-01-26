import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableHighlight
} from 'react-native';
import { Overlay } from 'react-native-elements';

import { images } from '../Utils/CoinIcons';

import { createStackNavigator } from 'react-navigation';



const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'white',
  },
})

const {
  overlay,
} = styles;





export default class ProfileOverlay extends React.Component {

  constructor(props){
    super(props)
    this.state ={
      w: 100,
      h: 100,
    }
  }

  render(){

    return (

      // if overlay is true
      {
        this.state.visible && (
          <View isVisible>
            <Text>Hello from Overlay!</Text>
          </View>
        );
      }
      // if overlay is true end

    );
  }

}
