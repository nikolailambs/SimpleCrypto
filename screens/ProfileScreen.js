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
  Button,
} from 'react-native';
import * as Haptics from 'expo-haptics';


import { images } from '../Utils/CoinIcons';
import { history } from '../Utils/HistoryHolder';
import { Ionicons } from '@expo/vector-icons';

import CoinCard from '../components/CoinCard';
import CryptoChart from '../components/CryptoChart';






export default class ProfileScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      historyLoaded: false,
      allowScroll: true,
      chartRange: '1Y',
      historyData: [[1,1], [2,2], [3,3], [4,2], [5,1], [6,1], [7,2], [8,3]],
    }
  };



  componentDidMount(){

    fetch(`https://api.coingecko.com/api/v3/coins/${this.props.navigation.state.params.id}/market_chart?vs_currency=usd&days=max`)
    .then((response) => response.json())
    .then((responseJson) => {

      let results = responseJson.prices;
      var d = new Date();
      d.setMonth(d.getMonth() - 12);

        this.setState({
          historyData: returnHistoryRangeArray(results, d),
          originalHistoryData: results,
          historyLoaded: true,
        });
    })
    .catch((error) =>{
        console.error(error);
    });

    this.fetchAdditionalInfos()

  }



  fetchWeek = () => {
    if (this.props.navigation.state.params.sparkline_in_7d) { // if already loaded sparklines
      let week = this.props.navigation.state.params.sparkline_in_7d.price;
      week = addTimeToWeekArray(week);
      this.setState({ historyData: week })
    }else{
      this.setState({fetchingAddData: true})
      fetch(`https://api.coingecko.com/api/v3/coins/${this.props.navigation.state.params.id}/market_chart?vs_currency=usd&days=7`)
      .then((response) => response.json())
      .then((responseJson) => {

        let results = responseJson.prices;

        this.setState({
          historyData: results,
          fetchingAddData: false,
        })
      })
      .catch((error) =>{
        console.error(error);
      });
    } // end of if already loaded
  }



  fetchDay = () => {
    fetch(`https://api.coingecko.com/api/v3/coins/${this.props.navigation.state.params.id}/market_chart?vs_currency=usd&days=1`)
    .then((response) => response.json())
    .then((responseJson) => {
      let results = responseJson.prices;
      this.setState({
        historyData: results,
      })
    })
    .catch((error) =>{
      console.error(error);
    });
  }



  fetchAdditionalInfos = () => {
    fetch(`https://data.messari.io/api/v2/assets/${this.props.navigation.state.params.symbol}/profile`)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        messariData: responseJson,
      })
    })
    .catch((error) =>{
      console.error(error);
    });
  }



  setScroll(bool) {
   this.setState({allowScroll: bool})
  }



  updateRange = (range) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    this.parseDataRange(range)
    this.setState({chartRange: range})
  }



  parseDataRange = (range) => {

      // if from coingecko API
      let objArr = this.state.originalHistoryData;
      var d = new Date();

        switch(range) {
        case "1Y":
          d.setMonth(d.getMonth() - 12);
          this.setState({historyData: returnHistoryRangeArray(objArr, d) })
          break;
        case "6M":
          // code block
          d.setMonth(d.getMonth() - 6);
          this.setState({historyData: returnHistoryRangeArray(objArr, d) })
          break;
        case "3M":
          // code block
          d.setMonth(d.getMonth() - 3);
          this.setState({historyData: returnHistoryRangeArray(objArr, d) })
          break;
        case "1M":
          // code block
          d.setMonth(d.getMonth() - 1);
          this.setState({historyData: returnHistoryRangeArray(objArr, d) })
          break;
        case "1W":
          // code block
          this.fetchWeek()
          break;
        case "1D":
          // code block
          this.fetchDay()
          break;
        default:
          this.setState({historyData: objArr })
        }

  }




  render() {

    let coin = this.props.navigation.state.params;

    let coinChange = this.state.tooltipChange ? this.state.tooltipChange : Math.round(coin.price_change_percentage_24h*100)/100;
    if (this.state.tooltipChange === 0) {
      coinChange = 0
    }

    var icon = images[coin.symbol.toLowerCase()]
      ? images[coin.symbol.toLowerCase()]
      : require("../node_modules/cryptocurrency-icons/128/black/generic.png");


    // messari data
    let governance = null;
    let consensus = null;
    let description = null;

    if (this.state.messariData) {
    // governance
      if ( this.state.messariData.data.profile.governance.onchain_governance.onchain_governance_type == null ) {
        governance = "Off-Chain";
      }else if( this.state.messariData.data.profile.governance.onchain_governance.onchain_governance_type.startsWith("No") ){
        governance = "Off-Chain";
      }else{
        governance = this.state.messariData.data.profile.governance.onchain_governance.onchain_governance_type;
      }
    // governance
      if ( this.state.messariData.data.profile.economics.consensus_and_emission.consensus.general_consensus_mechanism == null ) {
        consensus = "n/a";
      }else if( this.state.messariData.data.profile.economics.consensus_and_emission.consensus.general_consensus_mechanism == "" ){
        consensus = "n/a";
      }else{
        consensus = this.state.messariData.data.profile.economics.consensus_and_emission.consensus.general_consensus_mechanism;
      }

    // description
      description = this.state.messariData.data.profile.general.overview.project_details.split(' ');

      for(var i=0; i < description.length; i++) {
        description[i] = description[i].replace(/<a/g, '');
        description[i] = description[i].replace(/href.*\">/g, '');
        description[i] = description[i].replace(/<\/a>/g, '');
      }
      description = description.join(' ').replace(/\s+/g, ' ');

    }



    return(
      <ScrollView scrollEnabled={this.state.allowScroll} style={styles.container}>
        <View style={styles.headerWrapper}>
          <View style={styles.headerContent} >
            <Image
              style={styles.image}
              source={ icon }
            />
            <View style={styles.ovalShadow} />
            <Text style={styles.nameText} >{coin.name}</Text>
          </View>
        </View>
        <View style={styles.coinPriceWrapper}>

          <Text style={styles.coinPrice}><Text style={styles.dollar}>$</Text>{
            this.state.tooltipValue ?
            this.state.tooltipValue
            :
            numberWithCommas(coin.current_price)
          }</Text>
          {
            // coinChange > 0 ?
            //   <Ionicons name="ios-arrow-up" size={32} color="#00BFA5" />
            // :
            //   <Ionicons name="ios-arrow-down" size={32} color="#DD2C00" />
            }
            <Text style={this.state.tooltipValue && !this.state.tooltipChange || coinChange == 0 ? styles.coinPerceGray : coinChange < 0 ? styles.coinPerce24Minus : styles.coinPerce24Plus}>{coinChange} %</Text>
        </View>

            <View>
              <CryptoChart
                historyData={ this.state.historyData }
                symbol={ coin.symbol }
                updateRange={(range) => this.updateRange(range) }
                chartRange={ this.state.chartRange }
                // interact with this screen
                setScroll={(bool)=>this.setScroll(bool)}
                setPriceValue={(val) => this.setState({tooltipValue: val})}
                setChangeValue={(val) => this.setState({tooltipChange: val})}
                // change chart color
                fetchingAddData={this.state.fetchingAddData || !this.state.historyLoaded}
              />

            </View>

        <View style={{marginTop: 40}}>

          <View style={styles.infoCards}>
            <Ionicons name="ios-at" size={35} color="#3a3a3a" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Symbol:</Text>
            <Text style={styles.infoValue}>{coin.symbol.toUpperCase()}</Text>
          </View>
          <View style={styles.infoCards}>
            <Ionicons name="ios-list" size={35} color="#3a3a3a" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Rank:</Text>
            <Text style={styles.infoValue}>{coin.market_cap_rank}</Text>
          </View>
          <View style={styles.infoCards}>
            <Ionicons name="ios-analytics" size={35} color="#3a3a3a" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Market Cap:</Text>
            <Text style={styles.infoValue}>$ {nFormatter(coin.market_cap, 2)}</Text>
          </View>
          <View style={styles.infoCards}>
            <Ionicons name="ios-pie" size={35} color="#3a3a3a" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Available Supply:</Text>
            <Text style={styles.infoValue}>{nFormatter(coin.circulating_supply, 2)}</Text>
          </View>
          <View style={styles.infoCards}>
            <Ionicons name="ios-wallet" size={35} color="#3a3a3a" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Total Supply:</Text>
            <Text style={styles.infoValue}>{nFormatter(coin.total_supply, 2)}</Text>
          </View>
{
          // messari data
}
          <View style={styles.infoCards}>
            <Ionicons name="ios-cog" size={35} color="#3a3a3a" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Consensus:</Text>
            <Text style={styles.infoValue}>{consensus}</Text>
          </View>
          <View style={styles.infoCards}>
            <Ionicons name="ios-cube" size={35} color="#3a3a3a" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Token type:</Text>
            <Text style={styles.infoValue}>{this.state.messariData ? this.state.messariData.data.profile.economics.token.token_type : null}</Text>
          </View>
          <View style={styles.infoCards}>
            <Ionicons name="ios-navigate" size={35} color="#3a3a3a" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Token usage:</Text>
            <Text style={styles.infoValue}>{this.state.messariData ? this.state.messariData.data.profile.economics.token.token_usage : null}</Text>
          </View>
          <View style={styles.infoCards}>
            <Ionicons name="ios-git-pull-request" size={35} color="#3a3a3a" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Governance type:</Text>
            <Text style={styles.infoValue}>{governance}</Text>
          </View>
          <View style={styles.infoCards}>
            <Ionicons name="ios-apps" size={35} color="#3a3a3a" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Category:</Text>
            <Text style={styles.infoValue}>{this.state.messariData ? this.state.messariData.data.profile.general.overview.category : null}</Text>
          </View>
          <View style={styles.infoCards}>
            <Ionicons name="ios-archive" size={35} color="#3a3a3a" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Sector:</Text>
            <Text style={styles.infoValue}>{this.state.messariData ? this.state.messariData.data.profile.general.overview.sector : null}</Text>
          </View>

          <View style={styles.coinDescription}>
            <Text style={{fontSize: 20, fontFamily: 'nunito'}}>{description}</Text>
          </View>

        </View>

      </ScrollView>
    )


  }

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



function addTimeToWeekArray(arrayPrices) {
  let result = []

  let oneWeek = 60 * 60 * 24 * 7 * 1000;
  let oneHour = 60 * 60 * 1000;

  let now = Date.now();
  let millisSum = 0;

  let timeArray = [];

  arrayPrices.forEach(function(price) {
    let time = now - millisSum;
    timeArray.push(time);
    millisSum += oneHour;
  });

  let reversedTime = timeArray.reverse();

  let i = 0;

  arrayPrices.forEach(function(price) {
    // console.log(userData.username);
    result.push( [reversedTime[i], price] );
    i += 1;
  });

  return result;
}



const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
  },
  image: {
    width: 60,
    height: 60,
  },
  imageShadow: {
    width: 60,
    height: 60,
    backgroundColor: '#f37f16',
    borderRadius: 30,
    position: 'absolute',
    zIndex: -1,
    top: 38,
    right: 174
  },
  ovalShadow: {
    marginTop: 8,
    width: 10,
    height: 10,
    borderRadius: 50,
    backgroundColor: '#e6e6e6',
    transform: [
      {scaleX: 5}
    ]
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
    fontFamily: 'nunito',
  },
  coinPriceWrapper: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinPrice: {
    fontSize: 55,
    fontFamily: 'nunito',
  },
  dollar: {
    fontSize: 25,
    color: '#979797',
    fontFamily: 'nunito',
  },
  coinPerce24Plus: {
    fontSize: 38,
    marginTop: 10,
    color: "#00BFA5",
    fontFamily: 'nunito',
  },
  coinPerce24Minus: {
    fontSize: 38,
    marginTop: 10,
    color: "#DD2C00",
    fontFamily: 'nunito',
  },
  coinPerceGray: {
    fontSize: 38,
    marginTop: 10,
    color: "#c9c9c9",
    fontFamily: 'nunito',
  },
  selected: {
    color: '#fc0018',
  },
  infoCards: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 20,
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 10,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowColor: '#d1d1d1',
    shadowOffset: { height: 5, width: 3 },
  },
  infoTitle: {
    width: '35%',
    textAlign: 'left',
    fontSize: 15,
    color: '#1a1a1a',
    fontFamily: 'nunito',
  },
  infoValue: {
    width: '55%',
    fontSize: 20,
    color: '#1a1a1a',
    textAlignVertical: 'center',
    fontWeight: 'bold',
    fontFamily: 'nunito',
  },
  infoIcon: {
    width: '20%',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  coinDescription: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 20,
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 10,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowColor: '#d1d1d1',
    shadowOffset: { height: 5, width: 3 },
  },
})

