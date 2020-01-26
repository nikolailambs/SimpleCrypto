import React from 'react';
import { View, Button, StyleSheet, Dimensions, PanResponder } from 'react-native';

import { LineChart, YAxis, Grid } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Circle, G, Line, Rect, Text, Defs, LinearGradient, Stop } from 'react-native-svg';

import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';



export default class CryptoChart extends React.PureComponent {
  constructor(props){
    super(props);
    this.state = {
      xtouch: 1
    }

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now

        console.log(evt.nativeEvent.touches)
        this.setState({xtouch: evt.nativeEvent.locationX})

      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}

        console.log(evt.nativeEvent.touches)
        this.setState({xtouch: evt.nativeEvent.locationX})
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });

  }

  render() {

    let data = parseObjectToDataArray(this.props.data)

    // console.log(data)

    const contentInset = { top: 20, bottom: 20 }

    var xSwipe = Math.round(this.state.xtouch) * 2;

    const Tooltip = ({ x, y }) => (
            <G
                x={ x( xSwipe ) }
                key={ 'tooltip' }
                onPress={ () => console.log('tooltip clicked') }
            >
                <G y={ 50 }>
                    <Rect
                        height={ 40 }
                        width={ 75 }
                        stroke={ 'grey' }
                        fill={ 'white' }
                        ry={ 10 }
                        rx={ 10 }
                    />
                    <Text
                      x={ 75 / 2 }
                      dy={ 20 }
                      alignmentBaseline={ 'middle' }
                      textAnchor={ 'middle' }
                      stroke={ '#4141ff' }
                    >
                        { `$${Math.round(data[ xSwipe ])}` }
                    </Text>
                </G>
                <G x={ 0}>
                    <Line
                        y1={ 400 }
                        y2={ y(data[ xSwipe ]) }
                        stroke={ 'grey' }
                        strokeWidth={ 2 }
                    />
                    <Circle
                        cy={ y(data[ xSwipe ]) }
                        r={ 6 }
                        stroke={ '#4141ff' }
                        strokeWidth={ 2 }
                        fill={ 'white' }
                    />
                </G>
            </G>
        )

    return (
      <View style={{ height: '90%', flexDirection: 'row', zIndex: 10}} {...this._panResponder.panHandlers}>

            <LineChart
                style={{ flex: 1, marginLeft: 16 }}
                data={ data }
                svg={{
                  strokeWidth: 2,
                  stroke: '#4141ff',
                }}
                contentInset={ { top: 20, bottom: 20 } }
            >
            <Tooltip/>

            </LineChart>

        </View>
      )
  }
}



function parseObjectToDataArray(crypto) {

  let data = crypto.data
  let dataArray = []

  data.forEach(function(obj) {

    dataArray.push( parseFloat(obj["priceUsd"]) )

  });

  return dataArray;
};




const styles = StyleSheet.create({

})
