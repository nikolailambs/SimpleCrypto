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

import { nFormatter } from '../Utils/Functions';




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
      chartColorOnChange: false
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
  // this.timer = setInterval(()=> this.getSparkLines(), 5000)
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
   fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=150&page=1&sparkline=true')
    .then((response) => response.json())
    .then((responseJson) => {

      // this.setState({chartColorOnChange: true})
      this.setState({
        originalData: responseJson,
        dataSource: responseJson,
        sparkLinesLoaded: true,
        refreshing: false,
      });
      // setInterval(() => this.setState({chartColorOnChange: false}), 1);

    })
    .catch((error) =>{
      console.error(error);
    });

  }



  async globalStats(){
    return fetch('https://api.coingecko.com/api/v3/global')
    .then((response) => response.json())
    .then((responseJson) => {

      this.setState({
        dataSourceGlobal: responseJson.data,
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
        onPress={() => this.props.navigation.navigate( 'ProfileScreen', {coin: coin, allCryptosData: this.state.originalData} )}
        // onPress={() => this.setState({overlay: true})}
        fetchIndex={this.state.fetchIndex}
        chartColorOnChange={this.state.chartColorOnChange}
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
      <View style={{flex: 1, backgroundColor: '#f8f8f8'}}>
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
          <View style={{flex: 1, flexDirection: 'row'}}><Text style={styles.homeHeaderTextTitle}>Total market cap:</Text><Text style={styles.homeHeaderText}>$ { nFormatter(global.total_market_cap.usd, 2) }</Text></View>
          <View style={{flex: 1, flexDirection: 'row'}}><Text style={styles.homeHeaderTextTitle}>24h volume:</Text><Text style={styles.homeHeaderText}>$ { nFormatter(global.total_volume.usd, 2) }</Text></View>
          <View style={{flex: 1, flexDirection: 'row'}}><Text style={styles.homeHeaderTextTitle}>Bitcoin dominance:</Text><Text style={styles.homeHeaderText}>{Math.round(global.market_cap_percentage.btc*100)/100}%</Text></View>
          <View style={{flex: 1, flexDirection: 'row'}}><Text style={styles.homeHeaderTextTitle}>24h change:</Text><Text style={[styles.homeHeaderText, {color: global.market_cap_change_percentage_24h_usd > 0 ? '#00BFA5' : '#DD2C00' }]}>{Math.round(global.market_cap_change_percentage_24h_usd*100)/100}%</Text></View>
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

        <View>
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
