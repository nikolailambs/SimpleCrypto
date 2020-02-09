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

import { createStackNavigator } from 'react-navigation';

import { LineChart, YAxis, Grid, AreaChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Line, LinearGradient, Path } from 'react-native-svg';

import { images } from '../Utils/CoinIcons';
import CryptoChart from './CryptoChart';

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);




export default class CoinCard extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      historyLoaded: false,
    }
  }


  async getCryptoHistory() {
    let oneday = 60 * 60 * 24 * 1000;
    let coinName = this.props.coin_name.toLowerCase().replace(/ /g,"-");

   fetch(`https://api.coincap.io/v2/assets/${coinName}/history?interval=h1&start=${Date.now() - oneday}&end=${Date.now()}`)
    .then((response) => response.json())
    .then((responseJson) => {

      if (responseJson.data) {
        if (responseJson.data.length != 0) {
          this.setState({
            historyData: responseJson,
            historyLoaded: true,
          })
        }
      }
    })
    .catch((error) =>{
      console.error(error);
    });

  }


  // _onPress = () => {
  //   // Animate the update
  //   LayoutAnimation.spring();
  //   if (this.state.selectedOverlay) {
  //     this.setState({h: this.state.h - 400, selectedOverlay: false})
  //   }else{
  //     this.props.historyFetch()
  //     // console.log(this.props.historyData)
  //     this.setState({h: this.state.h + 400, selectedOverlay: true, historyIsLoaded: true})
  //   }
  // }





render(){

  if (!this.state.historyLoaded) {
    if (this.props.rank < this.props.fetchIndex) {
      console.log(this.props.rank)
      console.log(this.props.coin_name)
      this.getCryptoHistory()
    }
  }

    var icon = images[this.props.symbol.toLowerCase()]
      ? images[this.props.symbol.toLowerCase()]
      : require("../node_modules/cryptocurrency-icons/128/black/generic.png");


  const Line = ({ line }) => (
    <Path
      key={'line'}
      d={line}
      stroke={this.state.historyLoaded ? '#4141ff' : '#cfcfcf'}
      strokeWidth={2}
      fill={'none'}
    />
  )

  return (
    // const { rank, symbol, coin_name, price_usd, percent_change_1h, percent_change_24h, percent_change_7d, onPress } = this.props
      <TouchableHighlight
        onPress={() => this.props.onPress()} 
        underlayColor='transparent'>
        <View style={cardContainer}>

          <View style={{flex: 1, flexDirection: 'row'}}>
            <Image
              style={styles.image}
              source={ icon }
            />
            <View>
              <Text style={coinSymbol}>{this.props.symbol}</Text>
              <Text style={coinName}>{this.props.coin_name}</Text>
            </View>
          </View>

              <View style={styles.chartContainer}>
                <AreaChart
                    style={{ flex: 1, marginLeft: 10, marginRight: 10 }}
                    data={ this.state.historyLoaded ? parseObjectToDataArray(this.state.historyData) : [1, 3, 2, 2, 3] }
                    curve={shape.curveNatural}
                    svg={{
                      fill: this.state.historyLoaded ? 'rgba(102, 122, 255, 0.2)' : 'rgba(207, 207, 207, 0.2)',
                    }}
                    contentInset={ { top: 10, bottom: 10 } }
                >
                <Line/>
                </AreaChart>
              </View>

              <View>
                <Text style={coinPrice}>{numberWithCommas(this.props.price_usd)}
                  <Text style={moneySymbol}>$</Text>
                </Text>
                <Text style={this.props.percent_change_24h < 0 ? coinPerce24Minus : coinPerce24Plus }> {this.props.percent_change_24h}
                  <Text style={moneySymbol}> %</Text>
                </Text>
              </View>


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


// prices
function parseObjectToDataArray(crypto) {
  let data = crypto.data
  let dataArray = []
  data.forEach(function(obj) {
    dataArray.push( parseFloat(obj["priceUsd"]) )
  });
  return dataArray;
};






const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    display: "flex",
    flexDirection: "row",
    justifyContent: 'space-between',
    backgroundColor: '#000000',
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
  },
  chartContainer: {
    height: '100%',
    width: 80,
    flexDirection: 'row',
  }
})

const {
  cardContainer,
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
