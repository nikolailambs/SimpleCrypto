
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
  Animated,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';


import { images } from '../Utils/CoinIconsColor';
import { history } from '../Utils/HistoryHolder';
import { renderPriceNumber, nFormatter } from '../Utils/Functions';


import CoinCard from '../components/CoinCard';
import CryptoChart from '../components/CryptoChart';






export default class ProfileScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
      return {
          headerLeft: () => (
            <TouchableOpacity
              style={{alignItems:'center',justifyContent:'center', width: 50, marginLeft: 10}}
              onPress={() => navigation.navigate('Home') }
            >
              <Ionicons name="ios-arrow-back" size={30} color="#a1a1a1" />
            </TouchableOpacity>
          ),
      };
  }


  constructor(props){
    super(props);
    this.state = {
      historyLoaded: false,
      allowScroll: true,
      chartRange: '1Y',
      historyData: [[1,1], [2,2], [3,3], [4,2], [5,1], [6,1], [7,2], [8,3]],
      scrollDown: 0,
      refreshing: false,
    }
    this.animatedScrollValue = new Animated.Value(0);
  };



  _onRefresh = () => {
    this.setState({refreshing: true, chartRange: '1Y'});
    // this.startAnimation();
    this.mainFetch();
    this.fetchAdditionalInfos();
  }



  componentDidMount(){
    this.mainFetch()
    this.fetchAdditionalInfos()
  }


  mainFetch = () => {
    fetch(`https://api.coingecko.com/api/v3/coins/${this.props.navigation.state.params.coin.id}/market_chart?vs_currency=usd&days=max`)
    .then((response) => response.json())
    .then((responseJson) => {

      let results = responseJson.prices;
      var d = new Date();
      d.setMonth(d.getMonth() - 12);

        this.setState({
          historyData: returnHistoryRangeArray(results, d),
          originalHistoryData: results,
          historyLoaded: true,
          refreshing: false,
        });
    })
    .catch((error) =>{
        console.error(error);
    });
  }



  fetchWeek = () => {
    if (this.props.navigation.state.params.coin.sparkline_in_7d) { // if already loaded sparklines
      let week = this.props.navigation.state.params.coin.sparkline_in_7d.price;
      week = addTimeToWeekArray(week);
      this.setState({ historyData: week })
    }else{
      this.setState({fetchingAddData: true})
      fetch(`https://api.coingecko.com/api/v3/coins/${this.props.navigation.state.params.coin.id}/market_chart?vs_currency=usd&days=7`)
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
    if (this.props.navigation.state.params.coin.sparkline_in_7d) { // if already loaded sparklines
      let week = this.props.navigation.state.params.coin.sparkline_in_7d.price;
      // var today = new Date();
      var yesterday = new Date(new Date().setDate(new Date().getDate()-1));

      day = returnHistoryRangeArray( addTimeToWeekArray(week), yesterday )
      this.setState({ historyData: day })

    }else{
      fetch(`https://api.coingecko.com/api/v3/coins/${this.props.navigation.state.params.coin.id}/market_chart?vs_currency=usd&days=1`)
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
    } // end of if already loaded
  }



  fetchAdditionalInfos = () => {
    fetch(`https://data.messari.io/api/v2/assets/${this.props.navigation.state.params.coin.symbol}/profile`)
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


  startAnimation () {
    // this.state.rotateAnim.setValue(0)
    Animated.timing(
      this.state.scrollDown,
      {
        toValue: 0,
        duration: 800,
        easing: Easing.linear
      }
    ).start(() => {
      this.startAnimation()
    })
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


    handleScroll = (event: Object) => {
      if (event.nativeEvent.contentOffset.y < 0) {
        this.setState({scrollDown: event.nativeEvent.contentOffset.y});
      }
    }




  render() {

    let coin = this.props.navigation.state.params.coin;
    let allCryptosData = this.props.navigation.state.params.allCryptosData;


    // select next and previous coin
    let coinArrayIndex = allCryptosData.map(function(e) { return e.symbol; }).indexOf(coin.symbol)

    let nextCoinIndex = coinArrayIndex == allCryptosData.length - 1 ? 0 : coinArrayIndex + 1;
    let nextCoin = allCryptosData[nextCoinIndex];


    let prevCoinIndex = coinArrayIndex == 0 ? allCryptosData.length - 1 : coinArrayIndex - 1;
    let prevCoin = allCryptosData[prevCoinIndex];

    // console.log(nextCoin)


    let coinChange = this.state.tooltipChange ? this.state.tooltipChange : Math.round(coin.price_change_percentage_24h*100)/100;
    if (this.state.tooltipChange === 0) {
      coinChange = 0
    }

    var icon = images[coin.symbol.toLowerCase()]
      ? images[coin.symbol.toLowerCase()]
      : require("../node_modules/cryptocurrency-icons/128/color/generic.png");

    var nextCoinIcon = images[nextCoin.symbol.toLowerCase()]
      ? images[nextCoin.symbol.toLowerCase()]
      : require("../node_modules/cryptocurrency-icons/128/color/generic.png");

    var prevCoinIcon = images[prevCoin.symbol.toLowerCase()]
      ? images[prevCoin.symbol.toLowerCase()]
      : require("../node_modules/cryptocurrency-icons/128/color/generic.png");


    // messari data
    let governance = 'no info';
    let consensus = 'no info';
    let description = 'no info';


    if (this.state.messariData) {
      if (!this.state.messariData.status.error_code) {
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
      if (this.state.messariData.data.profile.general.overview.project_details) {
        description = this.state.messariData.data.profile.general.overview.project_details.split(' ');


        for(var i=0; i < description.length; i++) {
          description[i] = description[i].replace(/<a/g, '');
          description[i] = description[i].replace(/href.*\">/g, '');
          description[i] = description[i].replace(/<\/a>/g, '');
        }
        description = description.join(' ').replace(/\s+/g, ' ');
      }
      // end of if description exists

      }
    }


    return(
      <ScrollView
        scrollEnabled={this.state.allowScroll}
        style={styles.container}
        onScroll={this.handleScroll}
        scrollEventThrottle={16}
        refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
              tintColor='transparent'
            />
          }
      >
        <View style={styles.headerWrapper}>
          <View style={styles.headerContent}>

            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={()=> this.props.navigation.push('ProfileScreen', {coin: prevCoin, allCryptosData: allCryptosData}) }>
                <Image
                  style={styles.nextImage}
                  source={ prevCoinIcon }
                />
              </TouchableOpacity>

              <Animated.Image
                style={[styles.image, {
                  transform: [{ rotateX: `${this.state.scrollDown*0.5}deg`}]
                  }
                ]}
                source={ icon }
              />

              <TouchableOpacity onPress={()=> this.props.navigation.push('ProfileScreen', {coin: nextCoin, allCryptosData: allCryptosData}) }>
                <Image
                  style={styles.nextImage}
                  source={ nextCoinIcon }
                />
              </TouchableOpacity>
            </View>

            <View style={styles.ovalShadow} />
            <Text style={styles.nameText} >{coin.name}</Text>
          </View>
        </View>
        <View style={styles.coinPriceWrapper}>

          <Text style={styles.coinPrice}><Text style={styles.dollar}>$</Text>{
            this.state.tooltipValue ?
            this.state.tooltipValue
            :
            renderPriceNumber(coin.current_price)
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
            <View style={styles.infoBlockWrapper}>
              <Ionicons name="ios-at" size={35} color="#3a3a3a" style={styles.infoIcon} />
              <View style={{width: '80%', marginLeft: 15}}>
                <Text style={styles.infoValue}>{coin.symbol.toUpperCase()}</Text>
                <Text style={styles.infoTitle}>symbol</Text>
              </View>
            </View>
            <View style={styles.infoBlockWrapper}>
              <Ionicons name="ios-list" size={35} color="#3a3a3a" style={styles.infoIcon} />
              <View style={{width: '80%', marginLeft: 15}}>
                <Text style={styles.infoValue}>{coin.market_cap_rank}</Text>
                <Text style={styles.infoTitle}>rank</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCards}>
            <View style={styles.infoBlockWrapper}>
              <Ionicons name="ios-analytics" size={35} color="#3a3a3a" style={styles.infoIcon} />
              <View style={{width: '80%', marginLeft: 15}}>
                <Text style={styles.infoValue}>$ {nFormatter(coin.market_cap, 2)}</Text>
                <Text style={styles.infoTitle}>market cap</Text>
              </View>
            </View>
            <View style={styles.infoBlockWrapper}>
              <Ionicons name="ios-pie" size={35} color="#3a3a3a" style={styles.infoIcon} />
              <View style={{width: '80%', marginLeft: 15}}>
                <Text style={styles.infoValue}>{nFormatter(coin.circulating_supply, 2)}</Text>
                <Text style={styles.infoTitle}>available supply</Text>
              </View>
            </View>
          </View>



          <View style={styles.infoCards}>
            <View style={styles.infoBlockWrapper}>
              <Ionicons name="ios-wallet" size={35} color="#3a3a3a" style={styles.infoIcon} />
              <View style={{width: '80%', marginLeft: 15}}>
                <Text style={styles.infoValue}>{nFormatter(coin.total_supply, 2)}</Text>
                <Text style={styles.infoTitle}>total supply</Text>
              </View>
            </View>
            {
          // messari data
            }
            <View style={styles.infoBlockWrapper}>
              <Ionicons name="ios-cog" size={35} color="#3a3a3a" style={styles.infoIcon} />
              <View style={{width: '80%', marginLeft: 15}}>
                <Text style={styles.infoValue}>{consensus}</Text>
                <Text style={styles.infoTitle}>consensus</Text>
              </View>
            </View>
          </View>



          <View style={styles.infoCards}>
            <View style={styles.infoBlockWrapper}>
              <Ionicons name="ios-cube" size={35} color="#3a3a3a" style={styles.infoIcon} />
              <View style={{width: '80%', marginLeft: 15}}>
                <Text style={styles.infoValue}>{this.state.messariData && !this.state.messariData.status.error_code ? this.state.messariData.data.profile.economics.token.token_type : 'no info'}</Text>
                <Text style={styles.infoTitle}>token type</Text>
              </View>
            </View>
            <View style={styles.infoBlockWrapper}>
              <Ionicons name="ios-navigate" size={35} color="#3a3a3a" style={styles.infoIcon} />
              <View style={{width: '80%', marginLeft: 15}}>
                <Text style={styles.infoValue}>{this.state.messariData && !this.state.messariData.status.error_code ? this.state.messariData.data.profile.economics.token.token_usage : 'no info'}</Text>
                <Text style={styles.infoTitle}>token usage</Text>
              </View>
            </View>
          </View>



          <View style={styles.infoCards}>
            <View style={styles.infoBlockWrapper}>
              <Ionicons name="ios-git-pull-request" size={35} color="#3a3a3a" style={styles.infoIcon} />
              <View style={{width: '80%', marginLeft: 15}}>
                <Text style={styles.infoValue}>{governance}</Text>
                <Text style={styles.infoTitle}>governance</Text>
              </View>
            </View>
            <View style={styles.infoBlockWrapper}>
              <Ionicons name="ios-apps" size={35} color="#3a3a3a" style={styles.infoIcon} />
              <View style={{width: '80%', marginLeft: 15}}>
                <Text style={styles.infoValue}>{this.state.messariData && !this.state.messariData.status.error_code ? this.state.messariData.data.profile.general.overview.category : 'no info'}</Text>
                <Text style={styles.infoTitle}>category</Text>
              </View>
            </View>
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
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: 60,
    height: 60,
  },
  nextImage: {
    width: 50,
    height: 50,
    opacity: 0.3,
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
    minHeight: 70,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 10,
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    // shadowColor: '#d1d1d1',
    // shadowOffset: { height: 5, width: 3 },
  },
  infoBlockWrapper: {
    width: '50%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    textAlign: 'left',
    fontSize: 15,
    color: '#5c5c5c',
    fontFamily: 'nunito',
  },
  infoValue: {
    fontSize: 23,
    width: '80%',
    color: '#000000',
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
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    // shadowColor: '#d1d1d1',
    // shadowOffset: { height: 5, width: 3 },
    marginBottom: 80,
  },
})

