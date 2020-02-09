import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  SafeAreaView,
} from 'react-native';

import { images } from '../Utils/CoinIcons';
import CoinCard from '../components/CoinCard';
import CryptoChart from '../components/CryptoChart';


const HEIGHT = Dimensions.get('window').height;
const WIDTH = Dimensions.get('window').width;


export default class OverlayScreen extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      height: HEIGHT/2,
    }
  }



  _onScroll(e){
    var offset_y = e.nativeEvent.contentOffset.y;
    if (offset_y > 0 ) {
     if (this.state.height >= 0){
      console.log(this.state.height)
      this.setState({height: this.state.height-offset_y});
     }
    }
    if (offset_y < 0){
      // if (this.state.height <= this.state.mapHeight){
        this.setState({height: this.state.height-offset_y});
      // }
    }

  }





render(){

  if (this.state.top >= 550) {
    this.props.closeOverlay()
  }


  return (
     <View  pointerEvents="box-none"style={{height: HEIGHT, width: WIDTH, position: 'absolute'}}>
        <View pointerEvents="none" style={{height: this.state.height, backgroundColor: 'transparent'}} />
        <View style={{ height: HEIGHT-this.state.height, backgroundColor: 'white'}}>
          <ScrollView onScroll={(e) => this._onScroll(e)} scrollEventThrottle={10} >
            <View style={{width: 50, height: 2, backgroundColor: 'gray', alignSelf: 'center', borderRadius: 2, marginTop: 5, marginBottom: 5}}/>
              <View style={{height: 50, width: '100%'}}>
                {
                  //TODO
                }
              </View>
              {
                this.props.coin ?
              <CoinCard
                key={this.props.coin.name}
                rank={this.props.coin.rank}
                coin_name={this.props.coin.name}
                symbol={this.props.coin.symbol}
                price_usd={renderPriceNumber(this.props.coin.price_usd)}
                percent_change_1h={this.props.coin.percent_change_1h}
                percent_change_24h={this.props.coin.percent_change_24h}
                percent_change_7d={this.props.coin.percent_change_7d}
              />
              :
              null
              }
              {
                this.props.historyLoaded ?
                  <CryptoChart
                    data={ this.props.historyData }
                    setScroll={this.props.setScroll}
                  />
                :
                null
              }
          </ScrollView>
        </View>
      </View>
    );
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
overlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'white',
    shadowColor: '#5c5c5c',
    shadowOffset: { width: 0, height: -70 },
    shadowOpacity: 0.3,
  },
})

const {
overlay,
} = styles;

