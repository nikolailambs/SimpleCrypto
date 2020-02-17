import React from 'react';
import { View, Button, StyleSheet, Dimensions, PanResponder, TouchableOpacity } from 'react-native';

import { LineChart, YAxis, Grid, Path } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Circle, G, Line, Rect, Text, Defs, LinearGradient, Stop, ClipPath } from 'react-native-svg';
import Moment from 'moment';
import * as Haptics from 'expo-haptics';

import { colors } from '../Utils/CoinColors';

import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';



export default class CryptoChart extends React.PureComponent {
  constructor(props){
    super(props);
    this.state = {
      tooltipOne: false,
      tooltipTwo: false,
      chartWidth: Dimensions.get('window').width - 40,
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
        // gestureState.d{x,y} will be set to zero PushNotificationIOS.=(NewData, NoData, ResultFailed, }, static, (, :)
        this.props.setScroll(false) // disable scroll
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        if (evt.nativeEvent.touches.length == 1) {
          this.setState({xtouch: evt.nativeEvent.locationX, tooltipOne: true})
          this.passTooltipToParent({valueOne: evt.nativeEvent.locationX})
        }

        if (evt.nativeEvent.touches.length == 2) {
          this.setState({xtouch: evt.nativeEvent.touches[0].locationX, tooltipOne: true})
          this.setState({xtouchTwo: evt.nativeEvent.touches[1].locationX, tooltipTwo: true})

          // pass to function
          this.passTooltipToParent({valueOne: evt.nativeEvent.touches[0].locationX, valueTwo: evt.nativeEvent.touches[1].locationX})
        }

        // pass values to parent

      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}

        if (evt.nativeEvent.touches.length == 1) {
          this.setState({xtouch: evt.nativeEvent.locationX, tooltipOne: true})
          this.passTooltipToParent({valueOne: evt.nativeEvent.locationX})
        }

        if (evt.nativeEvent.touches.length == 2) {
          this.setState({xtouch: evt.nativeEvent.touches[0].locationX, tooltipOne: true})
          this.setState({xtouchTwo: evt.nativeEvent.touches[1].locationX, tooltipTwo: true})

          // pass to function
          this.passTooltipToParent({valueOne: evt.nativeEvent.touches[0].locationX, valueTwo: evt.nativeEvent.touches[1].locationX})
        }

        // pass values to parent


      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
          this.props.setScroll(true) // disable scroll
          this.props.setPriceValue(false) // disable tooltip
          this.props.setChangeValue(false) // disable tooltip
          this.setState({tooltipOne: false, tooltipTwo: false})
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
          this.props.setScroll(true) // disable scroll
          this.props.setPriceValue(false) // disable tooltip
          this.props.setChangeValue(false) // disable tooltip
          this.setState({tooltipOne: false, tooltipTwo: false})
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });

  }




  passTooltipToParent = ({valueOne, valueTwo}) => {

    // wie in render method
    let data = this.props.historyData.length > 1000 ? groupAverage(parseObjectToDataArray(this.props.historyData), 2) : parseObjectToDataArray(this.props.historyData);
    var chartWidth = this.state.chartWidth; // better chart width also dimension works too

    let xSwipe = Math.floor((data.length) * valueOne/chartWidth);
    if (xSwipe >= data.length ) {
      xSwipe = data.length - 1
    }
    if (xSwipe <= 0 ) {
      xSwipe = 0
    }
    let xSwipeTwo = Math.floor((data.length) * valueTwo/chartWidth);
    if (xSwipeTwo >= data.length ) {
      xSwipeTwo = data.length - 1
    }
    if (xSwipeTwo <= 0 ) {
      xSwipeTwo = 0
    }
    // new für tooltip

    let firstTooltipValue = data[xSwipe];
    let secondTooltipValue = data[xSwipeTwo];
    let upperBound = 0;
    let lowerBound = 0;

    if (xSwipe > xSwipeTwo) {
      upperBound = firstTooltipValue;
      lowerBound = secondTooltipValue;
    }else{
      upperBound = secondTooltipValue;
      lowerBound = firstTooltipValue;
    }

    let passedVal = valueTwo ? `${renderPriceNumber(lowerBound)} - ${renderPriceNumber(upperBound)}` : renderPriceNumber(firstTooltipValue);

    if(valueTwo){
      let change = ((upperBound-lowerBound)/lowerBound) * 100;
      this.props.setChangeValue( Math.round(change * 100) / 100 );
    }

    this.props.setPriceValue(passedVal)
  }






  render() {

    var color = colors[this.props.symbol.toLowerCase().replace(/\W/, '')]
      ? colors[this.props.symbol.toLowerCase().replace(/\W/, '')]
      : '#4141ff';

    if (this.props.fetchingAddData) {
      color = '#cacaca'
    }

    Moment.locale('en');


    let data = this.props.historyData.length > 1000 ? groupAverage(parseObjectToDataArray(this.props.historyData), 2) : parseObjectToDataArray(this.props.historyData);
    let dates = this.props.historyData.length > 1000 ? groupAverage(parseObjectToDatesArray(this.props.historyData), 2) : parseObjectToDatesArray(this.props.historyData);


    const contentInset = { top: 20, bottom: 20 };

    // chart width
    var chartWidth = this.state.chartWidth; // better chart width also dimension works too
    // first tooltop
    let xSwipe = Math.floor((data.length) * this.state.xtouch/chartWidth);
    if (xSwipe >= data.length ) {
      xSwipe = data.length - 1
    }
    if (xSwipe <= 0 ) {
      xSwipe = 0
    }
    // second Tooltip
    let xSwipeTwo = Math.floor((data.length) * this.state.xtouchTwo/chartWidth);
    if (xSwipeTwo >= data.length ) {
      xSwipeTwo = data.length - 1
    }
    if (xSwipeTwo <= 0 ) {
      xSwipeTwo = 0
    }

// set values
    let firstDate = dates[xSwipe];
    let secondDate = dates[xSwipeTwo];

    // tooltip one
      const Tooltip = ({ x, y }) => (
            <G
                x={ x(xSwipe) }
                key={ 'tooltip' }
            >
                <G y={ 345 }>
                  <Text
                      x={ 0 }
                      dy={ 20 }
                      alignmentBaseline={ 'middle' }
                      textAnchor={ 'middle' }
                  >
                      { `${Moment(firstDate).format('Do MMM YY')}` }
                  </Text>
                </G>
                <G x={ 0 }>
                    <Line
                        y1={ 355 }
                        y2={ y(data[ xSwipe ]) }
                        stroke={ color }
                        strokeWidth={ 2 }
                    />
                    <Circle
                        cy={ y(data[ xSwipe ]) }
                        r={ 6 }
                        stroke={ color }
                        strokeWidth={ 2 }
                        fill={ 'white' }
                    />
                </G>
            </G>
        )

    // tooltip two
      const TooltipTwo = ({ x, y }) => (
            <G
                x={ x(xSwipeTwo) }
                key={ 'tooltip' }
            >
                <G y={ 345 }>
                  <Text
                      x={ 0 }
                      dy={ 20 }
                      alignmentBaseline={ 'middle' }
                      textAnchor={ 'middle' }
                  >
                      { `${Moment(secondDate).format('Do MMM YY')}` }
                  </Text>
                </G>
                <G x={ 0 }>
                    <Line
                        y1={ 355 }
                        y2={ y(data[ xSwipeTwo ]) }
                        stroke={ color }
                        strokeWidth={ 2 }
                    />
                    <Circle
                        cy={ y(data[ xSwipeTwo ]) }
                        r={ 6 }
                        stroke={ color }
                        strokeWidth={ 2 }
                        fill={ 'white' }
                    />
                </G>
            </G>
        )



        const Clips = ({ x, width }) => (
            <Defs key={ 'clips' }>
              <ClipPath id={ 'clip-path-1' }>
                <Rect x={ x(xSwipe) } y={ '0' } width={ x(xSwipeTwo) - x(xSwipe) } height={ '100%' }/>
              </ClipPath>
            </Defs>
        )


      const ColorLine = ({ line }) => (
          <Path
              key={ 'line-1' }
              d={ line }
              stroke={ color }
              strokeWidth={ 2 }
              fill={ 'none' }
              clipPath={ 'url(#clip-path-1)' }
          />
        )



    return (
      <View>
        <View
          style={styles.chartContainer} {...this._panResponder.panHandlers}
          onLayout={(event) => {
              var {x, y, width, height} = event.nativeEvent.layout;
              this.setState({chartWidth: width })
          }}>
              <LineChart
                  style={{ flex: 1 }}
                  data={ data }
                  animate={ true }
                  svg={{
                    strokeWidth: 2,
                    // stroke: '#c5c5c5',
                    stroke: color,
                  }}
                  curve={shape.curveNatural}
                  contentInset={ { top: 40, bottom: 30 } }
              >
              {
                  // <ColorLine/>
              }
                {
                  // this.state.tooltipTwo ?
                  // <Clips/>
                  //  :
                  // null
                }

                {
                  this.state.tooltipOne ?
                    <Tooltip/>
                  :
                  null
                }
                {
                  this.state.tooltipTwo ?
                    <TooltipTwo/>
                  :
                  null
                }


              </LineChart>
          </View>

              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', margin: 20 }}>
                <Button backgroundColor={"#3fffff"} title="All" onPress={() => this.props.updateRange("All") } color={ this.props.chartRange == "All" ? color : "#292929"} />
                <Button backgroundColor={"#3fffff"} title="1Y" onPress={() => this.props.updateRange("1Y") } color={ this.props.chartRange == "1Y" ? color : "#292929"} />
                <Button backgroundColor={"#3fffff"} title="6M" onPress={() => this.props.updateRange("6M") } color={ this.props.chartRange == "6M" ? color : "#292929"} />
                <Button backgroundColor={"#3fffff"} title="3M" onPress={() => this.props.updateRange("3M") } color={ this.props.chartRange == "3M" ? color : "#292929"} />
                <Button backgroundColor={"#3fffff"} title="1M" onPress={() => this.props.updateRange("1M") } color={ this.props.chartRange == "1M" ? color : "#292929"} />
                <Button backgroundColor={"#3fffff"} title="1W" onPress={() => this.props.updateRange("1W") } color={ this.props.chartRange == "1W" ? color : "#292929"} />
              </View>

          </View>
      )
  }
}






// prices
function parseObjectToDataArray(crypto) {
  let data = crypto
  let dataArray = []

  data.forEach(function(array) {
    dataArray.push( parseFloat(array[1]) )
  });

  return dataArray;
};



// dates
function parseObjectToDatesArray(crypto) {
  let data = crypto
  let datesArray = []

  data.forEach(function(array) {
    datesArray.push( new Date(array[0]) )
  });

  return datesArray;
};



function renderPriceNumber(x){
  if(x >= 1000){
    return(numberWithCommas(parseFloat(x).toFixed(1)))
  }else if(x >= 100){
    return(numberWithCommas(parseFloat(x).toFixed(2)))
  }else if(x >= 10){
    return(numberWithCommas(parseFloat(x).toFixed(3)))
  }else{
    return(numberWithCommas(parseFloat(x).toFixed(4)))
  }
}



function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}



function groupAverage(arr, n) {
  var result = [];
  for (var i = 0; i < arr.length;) {
    var sum = 0;
    for(var j = 0; j< n; j++){
      // Check if value is numeric. If not use default value as 0
      sum += +arr[i++] || 0
    }
    result.push(sum/n);
  }
  return result
}



const styles = StyleSheet.create({
  chartContainer: {
    height: 370,
    flexDirection: 'row',
    zIndex: 10,
    marginTop: 50,
    marginRight: 20,
    marginLeft: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowColor: '#d1d1d1',
    shadowOffset: { height: 5, width: 3 },
  },
})
