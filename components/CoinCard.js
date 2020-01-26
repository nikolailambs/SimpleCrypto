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
} from 'react-native';
import { images } from '../Utils/CoinIcons';

import { createStackNavigator } from 'react-navigation';

import CryptoChart from './CryptoChart';

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);




export default class CoinCard extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      h: 100,
      selectedOverlay: false,
      historyIsLoaded: false,
      // historyData: {data: [{priceUsd: 1}, {priceUsd: 1}, {priceUsd: 1}, {priceUsd: 1}]}
    }
  }




  _onPress = () => {
    // Animate the update
    LayoutAnimation.spring();
    if (this.state.selectedOverlay) {
      this.setState({h: this.state.h - 400, selectedOverlay: false})
    }else{
      this.props.historyFetch()
      // console.log(this.props.historyData)
      this.setState({h: this.state.h + 400, selectedOverlay: true, historyIsLoaded: true})
    }
  }





render(){

    var icon = images[this.props.symbol.toLowerCase()]
      ? images[this.props.symbol.toLowerCase()]
      : require("../node_modules/cryptocurrency-icons/128/black/generic.png");

  return (
    // const { rank, symbol, coin_name, price_usd, percent_change_1h, percent_change_24h, percent_change_7d, onPress } = this.props
    <TouchableHighlight onPress={this._onPress} underlayColor='transparent'>
      <View style={[container, {height: this.state.h}]}>
          <View style={upperRow}>
            {
              // <Text style={rankNumber}>{this.props.rank}</Text>
            }
            <Image
              style={styles.image}
              source={ icon }
            />
            <View>
              <Text style={coinSymbol}>{this.props.symbol}</Text>
              <Text style={coinName}>{this.props.coin_name}</Text>
            </View>
            <Text style={coinPrice}>{numberWithCommas(this.props.price_usd)}
              <Text style={moneySymbol}>$ </Text>
              <Text style={this.props.percent_change_24h < 0 ? coinPerce24Minus : coinPerce24Plus }> {this.props.percent_change_24h}
                <Text style={moneySymbol}>% </Text>
              </Text>
            </Text>
          </View>

          {
            this.props.historyLoaded == this.props.coin_name && this.state.selectedOverlay ?
            <View>
              <CryptoChart
                data={ this.props.historyData }
              />
            </View>
            :
            null
          }

      </View>
    </TouchableHighlight>
    );
  }
}

function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}









const styles = StyleSheet.create({
  container: {
    position: 'relative',
    display: "flex",
    marginBottom: 20,
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowColor: '#d1d1d1',
    shadowOffset: { height: 5, width: 3 },
    zIndex: 2,
  },
  upperRow: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
  },
  coinSymbol: {
    fontSize: 20,
    marginTop: 15,
    marginLeft: 20,
    marginRight: 5,
  },
  coinPrice: {
    fontSize: 20,
    marginTop: 15,
    marginLeft: "auto",
    marginRight: 10,
    fontWeight: 'bold'
  },
  image: {
    marginTop: 10,
    width: 40,
    height: 40,
  },
  moneySymbol: {
    fontWeight: 'normal'
  },
  statisticsContainer: {
    display: "flex",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  coinName: {
    marginLeft: 10,
    color: '#919191'
  },
  percentChangePlus: {
    color: "#00BFA5",
    marginLeft: 10
  },
  percentChangeMinus: {
    color: "#DD2C00",
    marginLeft: 10
  },
  coinPerce24Plus: {
    fontSize: 20,
    color: "#00BFA5",
    marginLeft: 10
  },
  coinPerce24Minus: {
    fontSize: 20,
    color: "#DD2C00",
    marginLeft: 10
  },
  rankNumber: {
    fontSize: 20,
    // width: 50,
    color: '#3a3a3a',
    textAlign: 'center',
    flex: 1
  }
})

const {
  container,
  image,
  moneySymbol,
  upperRow,
  coinSymbol,
  coinName,
  coinPrice,
  statisticsContainer,
  seperator,
  percentChangePlus,
  percentChangeMinus,
  coinPerce24Minus,
  coinPerce24Plus,
  rankNumber,
  chartContainer
} = styles;
