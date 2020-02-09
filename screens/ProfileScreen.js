import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  RefreshControl
} from 'react-native';
import { images } from '../Utils/CoinIcons';

import CoinCard from '../components/CoinCard';
import CryptoChart from '../components/CryptoChart';




export default class ProfileScreen extends React.Component {
// static navigationOptions = {
//   title: "Profile"
//   };

  constructor(props){
    super(props);
    this.state = {
      historyLoaded: false,
      allowScroll: true,
    }
  };

  componentDidMount(){
    fetch(`https://api.coincap.io/v2/assets/${this.props.navigation.state.params.name.toLowerCase().replace(/ /g,"-")}/history?interval=d1`)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        historyData: responseJson,
        historyLoaded: true,
      })
    })
    .catch((error) =>{
      console.error(error);
    });

  }


  setScroll(bool) {
   this.setState({allowScroll: bool})
  }




  render() {

    let coin = this.props.navigation.state.params;

    var icon = images[coin.symbol.toLowerCase()]
      ? images[coin.symbol.toLowerCase()]
      : require("../node_modules/cryptocurrency-icons/128/black/generic.png");

    return(
      <ScrollView scrollEnabled={this.state.allowScroll}>
        <View style={styles.headerWrapper}>
          <View style={styles.headerContent} >
            <Image
              style={styles.image}
              source={ icon }
            />
            <Text style={styles.nameText} >{coin.name}</Text>
            {
              // <Text>{coin.symbol}</Text>
              //<Text style={styles.rankText}>{coin.rank}</Text>
            }
          </View>
        </View>
        <View style={styles.coinPriceWrapper}>

          <Text style={styles.coinPrice}><Text style={styles.dollar}>$</Text>{
            this.state.tooltipValue ?
            this.state.tooltipValue
            :
            renderPriceNumber(coin.price_usd)
          }</Text>
          {
          this.state.tooltipChange ?
            <Text style={this.state.tooltipChange < 0 ? styles.coinPerce24Minus : styles.coinPerce24Plus}>{this.state.tooltipChange} %</Text>
          :
            <Text style={coin.percent_change_24h < 0 ? styles.coinPerce24Minus : styles.coinPerce24Plus}>{coin.percent_change_24h} %</Text>
          }
        </View>
          {
            this.state.historyLoaded ?
            <View>
              <CryptoChart
                data={ this.state.historyData }
                setScroll={(bool)=>this.setScroll(bool)}
                setPriceValue={(val) => this.setState({tooltipValue: val})}
                setChangeValue={(val) => this.setState({tooltipChange: val})}
              />
            </View>
            :
            null
          }
      </ScrollView>
    )


  }

}




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


function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: "k" },
    { value: 1E6, symbol: "M" },
    { value: 1E9, symbol: "B" },
    { value: 1E12, symbol: "T" },
    { value: 1E15, symbol: "P" },
    { value: 1E18, symbol: "E" }
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (Math.abs(num) >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}





const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
  },
  image: {
    marginTop: 10,
    width: 60,
    height: 60,
  },
  headerWrapper: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection:'row',
    height: 200,
  },
  headerContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 25,
    marginTop: 10,
  },
  coinPriceWrapper: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinPrice: {
    fontSize: 55,
  },
  dollar: {
    fontSize: 25,
    color: '#979797',
  },
  coinPerce24Plus: {
    fontSize: 38,
    marginTop: 10,
    color: "#00BFA5",
  },
  coinPerce24Minus: {
    fontSize: 38,
    marginTop: 10,
    color: "#DD2C00",
  },
})

