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
import { SearchBar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';

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
      search: '',
      sort: 'market_cap_rank',
      resorting: false,
    }
  };

  _onRefresh = () => {
    this.setState({refreshing: true});
    this.getSparkLines()
    this.globalStats()
  }


 componentDidMount(){

  this.getCryptos()
  this.globalStats()
  this.getSparkLines()
  // funktioniert:
  // this.timer = setInterval(()=> this.getCryptos(), 5000)
 }



  async getCryptos(){

   fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false')
    .then((response) => response.json())
    .then((responseJson) => {

      this.setState({
        originalData: responseJson,
        dataSource: responseJson,
        refreshing: false,
        isLoading: false,
      }, function(){

      });

    })
    .catch((error) =>{
      console.error(error);
    });

  }


  async getSparkLines(){

   fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true')
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        originalData: responseJson,
        dataSource: responseJson,
        sparkLinesLoaded: true,
        refreshing: false,
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




  updateSearch = search => {
    this.setState({ search });
    let data = this.state.originalData
    // console.log( data.filter((item) => item.name.startsWith(search)) )
    this.setState({dataSource: data.filter((item) => item.name.startsWith(search))})
  }


  sorting() {
    this.setState({resorting: false})

    let sort = '';
    if (this.state.sort == 'market_cap_rank') {
      sort = 'price_change_percentage_24h_up'
    }else if(this.state.sort == 'price_change_percentage_24h_up'){
      sort = 'price_change_percentage_24h'
    }else if(this.state.sort == 'price_change_percentage_24h'){
      sort = 'market_cap_rank'
    }

    let data = this.state.dataSource;

    if (sort == 'price_change_percentage_24h_up') {
      data.sort((a,b) => (a['price_change_percentage_24h'] < b['price_change_percentage_24h']) ? 1 : ((b['price_change_percentage_24h'] < a['price_change_percentage_24h']) ? -1 : 0));
    }else{
      data.sort((a,b) => (a[sort] > b[sort]) ? 1 : ((b[sort] > a[sort]) ? -1 : 0));
    }

    this.setState({ sort: sort, dataSource: data, resorting: true })
  }



  renderCoinCards() {
    const crypto = this.state.dataSource

    return crypto.map((coin) =>
      <CoinCard
        id={coin.id}
        index={ crypto.map(function(coin) { return coin.name }).indexOf(coin.name) }
        rank={coin.market_cap_rank}
        coinName={coin.name}
        symbol={coin.symbol}
        price={coin.current_price}
        percentChange={coin.price_change_percentage_24h}
        marketCap={coin.market_cap}
        availableSupply={coin.circulating_supply}
        totalSupply={coin.total_supply}
        sparkLines={ this.state.sparkLinesLoaded ? groupAverage(coin.sparkline_in_7d.price.slice(Math.max(coin.sparkline_in_7d.price.length - Math.round(coin.sparkline_in_7d.price.length/7), 0)), 2) : [1, 3, 2, 2, 3] }
        sparkLinesLoaded={ this.state.sparkLinesLoaded }
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

    let icon = 'ios-list'
    if (this.state.sort == 'price_change_percentage_24h_up') {
      icon = 'ios-trending-up'
    }else if(this.state.sort == 'price_change_percentage_24h'){
      icon = 'ios-trending-down'
    }


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
          <View style={{flex: 1, flexDirection: 'row'}}><Text style={styles.homeHeaderTextTitle}>Total market cap:</Text><Text style={styles.homeHeaderText}>$ { nFormatter(global.total_market_cap_usd, 2) }</Text></View>
          <View style={{flex: 1, flexDirection: 'row'}}><Text style={styles.homeHeaderTextTitle}>24h Volume:</Text><Text style={styles.homeHeaderText}>$ { nFormatter(global.total_24h_volume_usd, 2) }</Text></View>
          <View style={{flex: 1, flexDirection: 'row'}}><Text style={styles.homeHeaderTextTitle}>Bitcoin dominance:</Text><Text style={styles.homeHeaderText}>{global.bitcoin_percentage_of_market_cap}%</Text></View>
          <View style={{flex: 1, flexDirection: 'row'}}><Text style={styles.homeHeaderTextTitle}>Active Currencies:</Text><Text style={styles.homeHeaderText}>{global.active_currencies}</Text></View>
          <View style={{flex: 1, flexDirection: 'row'}}><Text style={styles.homeHeaderTextTitle}>Active Assets:</Text><Text style={styles.homeHeaderText}>{global.active_assets}</Text></View>
        </View>
        <View style={{flex: 1, flexDirection: 'row' }}>
          <SearchBar
            placeholder="Search coin..."
            onChangeText={this.updateSearch}
            value={this.state.search}
            containerStyle={{backgroundColor: 'transparent', borderWidth: 0, shadowColor: 'white', borderBottomColor: 'transparent', borderTopColor: 'transparent', marginBottom: 10, width: '85%'}}
            inputContainerStyle={{backgroundColor: '#ffffff', borderRadius: 20}}
          />
          <TouchableOpacity
            onPress={() => this.sorting()} 
            style={{ width: '15%', alignItems: 'center', justifyContent: 'center', margin: 0 }}
          >
            <Ionicons name={icon} size={30} color="#3a3a3a" style={{marginBottom: 10}} />
          </TouchableOpacity>
        </View>

        <View style={{minHeight: 500}}>
          {this.renderCoinCards()}
        </View>
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


function returnHistoryRangeArray(arrayOfArrays, date){

  let d = date
  d.setHours(0, 0, 0);
  d.setMilliseconds(0);
  let millis = d
  let newArrayOfArrays = []

  arrayOfArrays.forEach(function(array) {
    // console.log(userData.username);
    if (array[0] >= millis) {
      newArrayOfArrays.push(array)
    };
  });
  return newArrayOfArrays;
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



HomeScreen.navigationOptions = {
  header: null,
};



const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 30,
    backgroundColor: '#f8f8f8',
  },
  homeHeader: {
    // height: 200,
    // backgroundColor: '#6479FF',
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  homeHeaderTitle: {
    fontSize: 35,
    marginBottom: 10,
    color: '#232323',
    textAlign: 'center',
    fontFamily: 'nunito',
  },
  homeHeaderTextTitle: {
    fontSize: 20,
    textAlign: 'right',
    width: '50%',
    color: '#232323',
    marginBottom: 15,
    fontFamily: 'nunito',
  },
  homeHeaderText: {
    fontSize: 20,
    width: '50%',
    color: '#232323',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
    fontFamily: 'nunitoBold',
  }
});
