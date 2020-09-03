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
  Animated,
  AsyncStorage,
} from 'react-native';

import { Overlay, SearchBar, Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';

import DashboardCard from '../components/DashboardCard';


export default class HomeScreen extends React.Component {
  constructor(props){
    super(props);
    this.state ={
      hotCoinsLoading: true,
      sparklinesLoaded: false,
      refreshing: false,

      favoriteCoinsLoaded: false,
      favoriteCoins: [],
    }
  };



  _onRefresh = () => {
    this.setState({refreshing: true});
    this.getCryptoHistory();
  }



  componentDidMount(){
    this.getHotCoins();
  }



  getFavoriteCoins = async () => {
    try {
      favoriteCoins = await AsyncStorage.getItem('favoriteCoins');
      this.setState({
        favoriteCoins: favoriteCoins,
        favoriteCoinsLoaded: true,
      })
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
  }



  async getHotCoins(){

   fetch('https://api.coingecko.com/api/v3/search/trending')
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        hotCoins: responseJson.coins,
        hotCoinsLoading: false,
      });
      this.getCryptoHistory();

    })
    .catch((error) =>{
      console.error(error);
    });

  }


  getCryptoHistory = async (id) => {

    let idArray = [];
    this.state.hotCoins.map((coin) => {
      if (coin.item) {
        idArray.push(coin.item.id)
      }else{
        idArray.push(coin.id)
      }
    });
    let idString = idArray.join('%2C');

   fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idString}&order=market_cap_desc&per_page=100&page=1&sparkline=true`)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        hotCoins: responseJson,
        refreshing: false,
        sparklinesLoaded: true,
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
    const hotCoins = this.state.hotCoins;

    return hotCoins.map((coin) =>
      <DashboardCard
        index={ hotCoins.map(function(coin) { return coin.name }).indexOf(coin.name) }
        rank={ this.state.sparklinesLoaded ? coin.market_cap_rank : coin.item.market_cap_rank }
        coinName={ this.state.sparklinesLoaded ? coin.name : coin.item.name }
        symbol={ this.state.sparklinesLoaded ? coin.symbol : coin.item.symbol }
        price={ this.state.sparklinesLoaded ? coin.current_price : 0 }
        percentChange={ this.state.sparklinesLoaded ? coin.price_change_percentage_24h : 0 }
        marketCap={ this.state.sparklinesLoaded ? coin.market_cap : 0 }
        availableSupply={ this.state.sparklinesLoaded ? coin.circulating_supply : 0 }
        totalSupply={ this.state.sparklinesLoaded ? coin.total_supply : 0 }
        sparkLines={ this.state.sparklinesLoaded ? groupAverage(coin.sparkline_in_7d.price.slice(Math.max(coin.sparkline_in_7d.price.length - Math.round(coin.sparkline_in_7d.price.length/7), 0)), 2) : [1, 3, 2, 2, 3] }
        sparklinesLoaded={ this.state.sparklinesLoaded }
        // coin history
        // historyData={this.state.historyData}
        // historyLoaded={this.state.historyLoaded}
        // historyFetch={()=>this.getCryptoHistory(coin)}
        // methods
        setScroll={(bool)=>this.setScroll(bool)}
        onPress={() => this.props.navigation.navigate( 'ProfileScreen', {coin: coin, allCryptosData: this.state.hotCoins} )}
        // scrollDown={this.state.scrollDown}
        // onPress={() => this.setState({overlay: true})}
        // fetchIndex={this.state.fetchIndex}
        // chartColorOnChange={this.state.chartColorOnChange}
      />
    )
  }






  render(){

    // if infos are still loading
    if(this.state.hotCoinsLoading){
      return(
        <View style={{flex: 1, paddingTop: 200}}>
          <ActivityIndicator/>
        </View>
        )
    }

    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
            // title={Moment(global.updated_at*1000).format('MMMM Do YYYY, h:mm:ss a')}
          />
        }>
        <Text style={styles.homeHeaderTitle}>🔥 Hottest Cryptos</Text>
        <View style={styles.homeHeader}>
          {this.renderCoinCards()}
        </View>
      </ScrollView>
    );
  }
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





// LinksScreen.navigationOptions = {
//   title: 'Wallet',
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  homeHeaderTitle: {
    fontSize: 35,
    marginBottom: 10,
    color: '#232323',
    textAlign: 'center',
    fontFamily: 'nunito',
  },
  homeHeader: {
     justifyContent: "flex-start",
     flexDirection: "row",
     flexWrap: "wrap",
     marginTop: 30
  },
});
