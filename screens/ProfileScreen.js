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

import Chart from '../components/CryptoChart';



export default class ProfileScreen extends React.Component {
static navigationOptions = {
  title: "Profile"
  };

  constructor(props){
    super(props);
    this.state ={
      isLoading: true,
    }
  };

  componentDidMount(){
    return fetch(`https://min-api.cryptocompare.com/data/histoday?fsym=${this.props.navigation.state.params.symbol}&tsym=USD&limit=2000`)
    .then((response) => response.json())
    .then((responseJson) => {

      this.setState({
        isLoading: false,
        dataSource: responseJson,
      }, function(){

      });

    })
    .catch((error) =>{
      console.error(error);
    });

  }

  render() {
    const { rank, symbol, coin_name, price_usd, percent_change_1h, percent_change_24h, percent_change_7d } = this.props.navigation.state.params
    const crypto = this.state.dataSource
    const data = parseObjectToDataArray(crypto)


if(this.state.isLoading){
      return(
        <View style={{flex: 1, paddingTop: 200}}>
          <ActivityIndicator/>
        </View>
        )
    }

    return(
      <View style={container}>
        <Text>{coin_name}</Text>
          <View style={profileRank}><Text style={profileRankText}>{rank}.</Text></View>
          <Image style={profileImage} source={{ uri: images[symbol] }} />
          <View style={profilePriceWrapper}>
            <Text style={coinProfilePrice}>{renderPriceNumber(price_usd)} $</Text>
            <Text style={percent_change_24h < 0 ? coinProfilePerce24Minus : coinProfilePerce24Plus }> {percent_change_24h} %</Text>
          </View>
        <Text style={profileSymbol}>{symbol}</Text>

          <Chart data={data} />

      </View>
      )
  }

}

function renderPriceNumber(x){
  if(x >= 1000){
    return(parseFloat(x).toFixed(1))
  }else if(x >= 100){
    return(parseFloat(x).toFixed(2))
  }else if(x >= 10){
    return(parseFloat(x).toFixed(3))
  }else{
    return(parseFloat(x).toFixed(4))
  }
  numberWithCommas(x)
};

function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

function parseObjectToDataArray(crypto) {
  var firstProp;
  var dataArray = new Array();

  for(var key in crypto) {
      if(key == "Data") {
          firstProp = crypto[key];
          break;
      }
  }

  for(var key in firstProp) {
    for(var i in firstProp[key]) {
      if(i == "close") {
        dataArray.push( firstProp[key][i] );
        break;
      }
    }
  }
  return dataArray;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    display: "flex",
    margin: 20,
    position: 'relative',
  },
  profilePriceWrapper: {
    flex: 1,
    position: 'absolute',
    right: 20,
    top: 40,
  },
  coinProfilePrice: {
    fontSize: 45,
  },
  profileImage: {
    position: 'absolute',
    left: 20,
    top: 40,
    width: 70,
    height: 70,
  },
  profileSymbol: {
    textAlign: 'center',
    fontSize: 30,
    fontSize: 18,
    marginTop: 20,
    alignSelf: 'stretch',
  },
  profileRank: {
    marginTop: -15,
  },
  profileRankText: {
    textAlign: 'center',
    fontSize: 150,
    margin: 0,
    color: 'white',
    zIndex: 0,
  },
  moneyProfileSymbol: {
    fontWeight: 'normal'
  },
  coinProfileName: {
    marginLeft: 10,
    color: '#919191'
  },
  coinProfilePerce24Plus: {
    fontSize: 30,
    color: "#00BFA5",
    marginLeft: 10
  },
  coinProfilePerce24Minus: {
    fontSize: 30,
    color: "#DD2C00",
    marginLeft: 10
  },
})

const {
  container,
  profileImage,
  profileSymbol,
  profileRank,
  profileRankText,
  moneyProfileSymbol,
  coinSymbol,
  coinProfileName,
  coinProfilePrice,
  coinProfilePerce24Minus,
  coinProfilePerce24Plus,
  profilePriceWrapper
} = styles;
