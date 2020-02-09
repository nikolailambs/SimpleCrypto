import * as WebBrowser from 'expo-web-browser';
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
  RefreshControl,
  TouchableHighlight,
} from 'react-native';

import CoinCard from '../components/CoinCard';
import OverlayScreen from './OverlayScreen';

import { MonoText } from '../components/StyledText';

// coinmarket global API: https://api.coinmarketcap.com/v1/global/


export default class HomeScreen extends React.Component {
  constructor(props){
    super(props);
    this.state ={
      isLoading: true,
      refreshing: false,
      globalIsLoaded: false,
      overlay: false,
      fetchIndex: 10,
    }
  };

  _onRefresh = () => {
    this.setState({refreshing: true});
    fetch('https://api.coinmarketcap.com/v1/ticker/')
    .then((response) => response.json())
    .then((responseJson) => {

      this.setState({
        dataSource: responseJson,
        refreshing: false
      }, function(){

      });

    })
    .catch((error) =>{
      console.error(error);
    });
  }


 componentDidMount(){

  this.getCryptos()
  this.globalStats()
  // funktioniert:
  // this.timer = setInterval(()=> this.getCryptos(), 5000)
 }



  async getCryptos(){

    console.log("tick")

   fetch('https://api.coinmarketcap.com/v1/ticker/')
    .then((response) => response.json())
    .then((responseJson) => {

      this.setState({
        dataSource: responseJson,
        isLoading: false,
      }, function(){

      });

    })
    .catch((error) =>{
      console.error(error);
    });

  }

  async globalStats(){
    return fetch('https://api.coinmarketcap.com/v1/global/')
    .then((response) => response.json())
    .then((responseJson) => {

      this.setState({
        dataSourceGlobal: responseJson,
        globalIsLoaded: true,
      }, function(){

      });

    })
    .catch((error) =>{
      console.error(error);
    });
  }



  setScroll(bool) {
   this.setState({allowScroll: bool})
  }




  renderCoinCards() {
    const crypto = this.state.dataSource

    return crypto.map((coin) =>
      <CoinCard
        key={coin.name}
        rank={coin.rank}
        coin_name={coin.name}
        symbol={coin.symbol}
        price_usd={renderPriceNumber(coin.price_usd)}
        percent_change_1h={coin.percent_change_1h}
        percent_change_24h={coin.percent_change_24h}
        percent_change_7d={coin.percent_change_7d}
        // coin history
        // historyData={this.state.historyData}
        // historyLoaded={this.state.historyLoaded}
        // historyFetch={()=>this.getCryptoHistory(coin)}
        // methods
        setScroll={(bool)=>this.setScroll(bool)}
        onPress={() => this.props.navigation.navigate('ProfileScreen', coin)}
        // onPress={() => this.setState({overlay: true})}
        fetchIndex={this.state.fetchIndex}
      />
    )
  }



  render(){
    const global = this.state.dataSourceGlobal


    if(this.state.isLoading || !this.state.globalIsLoaded){
      return(
        <View style={{flex: 1, paddingTop: 200}}>
          <ActivityIndicator/>
        </View>
        )
    }


    return(
      <View style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          // scrolling
          onScroll={() => this.setState({fetchIndex: this.state.fetchIndex + 1 })}
          scrollEventThrottle={600}
          // refreshing
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }>
        <View style={styles.homeHeader}>
          <Text style={styles.homeHeaderTitle}>All Cryptos</Text>
          <Text style={styles.homeHeaderText}>Total market cap: $ { nFormatter(global.total_market_cap_usd, 2) }</Text>
          <Text style={styles.homeHeaderText}>24h Volume: $ { nFormatter(global.total_24h_volume_usd, 2) }</Text>
          <Text style={styles.homeHeaderText}>Bitcoin dominance: {global.bitcoin_percentage_of_market_cap}%</Text>
          <Text style={styles.homeHeaderText}>Active Currencies: {global.active_currencies}</Text>
          <Text style={styles.homeHeaderText}>Active Assets: {global.active_assets}</Text>
        </View>
          {this.renderCoinCards()}
        </ScrollView>

        {
            // <OverlayScreen
            //   historyData={this.state.historyData}
            //   historyLoaded={this.state.historyLoaded}
            //   coin={this.state.coinOverlay}
            //   closeOverlay={()=>this.setState({overlay: false})}
            //   setScroll={(bool)=>this.setScroll(bool)}
            // />
        }
      </View>
      );
  }


} // end of all




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





HomeScreen.navigationOptions = {
  header: null,
};



const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 30,
    backgroundColor: '#f8f8f8',
  },
  homeHeader: {
    height: 320,
    // backgroundColor: '#6479FF',
    flex: 1,
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: -40,
  },
  homeHeaderTitle: {
    fontSize: 35,
    color: '#232323',
    textAlign: 'center',
  },
  homeHeaderText: {
    fontSize: 20,
    color: '#232323',
    textAlign: 'center',
  }
});
