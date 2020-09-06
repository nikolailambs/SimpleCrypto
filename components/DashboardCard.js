import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableHighlight,
  Animated,
  Easing,
  NativeModules,
  LayoutAnimation,
  Dimensions
} from 'react-native';

import { createStackNavigator } from 'react-navigation';

import { LineChart, YAxis, Grid, AreaChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { images } from '../Utils/CoinIcons';
import { colors } from '../Utils/CoinColors';
import { renderPriceNumber } from '../Utils/Functions';

import CryptoChart from './CryptoChart';

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const { width } = Dimensions.get("window");



export default class DashboardCard extends React.Component {
  constructor(props){
    super(props)
    this.state = {
    }
  }




render(){

    var icon = images[this.props.symbol.toLowerCase().replace(/\W/, '')]
      ? images[this.props.symbol.toLowerCase().replace(/\W/, '')]
      : {uri: this.props.image};

    var color = colors[this.props.symbol.toLowerCase().replace(/\W/, '')]
      ? colors[this.props.symbol.toLowerCase().replace(/\W/, '')]
      : '#ffffff';

    var transparent = color + '33'


    var areaFill = 'rgba(207, 207, 207, 0.2)';
    var sparkLine = 'rgba(207, 207, 207, 1)';
    if (this.props.sparklinesLoaded) {
      // if (this.props.chartColorOnChange) {
        areaFill = this.props.percentChange > 0 ? 'rgba(0, 191, 165, 0.1)' : 'rgba(221, 44, 0, 0.1)';
        sparkLine = this.props.percentChange > 0 ? 'rgba(0, 191, 165, 0.6)' : 'rgba(221, 44, 0, 0.6)';
      // }else{
        // areaFill = 'rgba(102, 122, 255, 0.2)';
        // sparkLine = 'rgba(102, 122, 255, 1)';
      // }
    }

    const Line = ({ line }) => (
      <Path
        key={'line'}
        d={line}
        stroke={ sparkLine }
        strokeWidth={2}
        fill={'none'}
      />
    )

    let linearGradientOffset = `${Math.abs(Math.round(this.props.percentChange))}%`

    const Gradient = ({ index }) => (
      <Defs key={index}>
          <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'40%'}>
              <Stop offset={'0%'} stopColor={areaFill} stopOpacity={0.1}/>
              <Stop offset={ linearGradientOffset } stopColor={areaFill} stopOpacity={0}/>
          </LinearGradient>
      </Defs>
    )


    const tileDimensions = calcTileDimensions(width, 2)  // -> change this number and see!


    return (

      // const { rank, symbol, coinName, price, percent_change_1h, percentChange, percent_change_7d, onPress } = this.props
        <TouchableHighlight
          onPress={() => this.props.onPress()} 
          underlayColor='#ffffff'>
          <View style={[styles.cardContainer, {width: tileDimensions.size, height: tileDimensions.size, marginHorizontal: tileDimensions.margin}]}>

            <View style={styles.logoNameWrapper}>
              <Image
                style={[styles.image, {backgroundColor: color}]}
                source={ icon }
              />
              <View>
                <Text style={coinSymbol}>{this.props.symbol.toUpperCase()}</Text>
                <Text style={coinName}>{this.props.coinName}</Text>
              </View>
            </View>

            <View style={styles.pricePercWrapper}>
              <Text style={coinPrice}>{ renderPriceNumber(getlength(this.props.price)) }
                <Text style={moneySymbol}>$</Text>
              </Text>
              <Text style={this.props.percentChange < 0 ? coinPerce24Minus : coinPerce24Plus }> {Math.round(this.props.percentChange*100)/100}
                <Text style={moneySymbol}> %</Text>
              </Text>
            </View>



            <View style={styles.chartContainer}>
              <AreaChart
                  style={{ flex: 1 }}
                  data={ this.props.sparkLines }
                  curve={shape.curveNatural}
                  svg={{
                    fill: 'url(#gradient)',
                  }}
                  contentInset={ { top: 10, bottom: 10 } }
              >
                <Gradient/>
                <Line/>
              </AreaChart>
            </View>

          </View>
        </TouchableHighlight>
      );
    }

}



const calcTileDimensions = (deviceWidth, tpr) => {
  const margin = deviceWidth / (tpr * 10);
  const size = (deviceWidth - margin * (tpr * 2)) / tpr;
  return { size, margin };
};






function getlength(number) {
  let char = number.toString().length;
  if (char >= 7) {
    return Math.round(number*10000000)/10000000;
  }else{
    return number;
  }
}



const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#fafafa',
    marginBottom: 20,
    padding: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    zIndex: 2,
  },
  logoNameWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 5,
  },
  coinSymbol: {
    fontSize: 20,
    fontFamily: 'nunito',
    textAlign: 'right',
  },
  coinName: {
    color: '#919191',
    fontFamily: 'nunito',
    textAlign: 'right',
  },
  pricePercWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  coinPrice: {
    fontSize: 20,
    marginRight: 5,
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'nunitoBold',
  },
  coinPerce24Plus: {
    fontSize: 20,
    color: "#00BFA5",
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'nunitoBold',
  },
  coinPerce24Minus: {
    fontSize: 20,
    color: "#DD2C00",
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'nunitoBold',
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 150 / 2,
    borderWidth: 1,
    borderColor: '#ffffff'
  },
  moneySymbol: {
    fontWeight: 'normal',
    fontFamily: 'nunito',
  },
  rankNumber: {
    fontSize: 20,
    color: '#3a3a3a',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'nunito',
  },
  chartContainer: {
    height: '50%',
    flexDirection: 'row',
  }
})

const {
  cardContainer,
  image,
  moneySymbol,
  coinSymbol,
  coinName,
  coinPrice,
  seperator,
  percentChangePlus,
  percentChangeMinus,
  coinPerce24Minus,
  coinPerce24Plus,
  rankNumber,
  chartContainer
} = styles;
