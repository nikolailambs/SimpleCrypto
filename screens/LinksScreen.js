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

import CoinCard from '../components/CoinCard';


export default class HomeScreen extends React.Component {
  constructor(props){
    super(props);
    this.state ={
      isLoading: true,
      userKeysLoading: false,
      refreshing: false,
      userKey: '0x5397Db3c8378123502146197847D68590Ba8de1A',
      search: '',
      overlayOpend: false,
    }
  };



  //  _onRefresh = () => {
  //   this.setState({refreshing: true});
  //   this.getSparkLines()
  //   this.globalStats()
  // }


 componentDidMount(){

    this.getUserKeys();
    // this.getWalletInfos();
    // this.getCryptos()

    // funktioniert aber nimmt sehr viel computation in Anspruch:
    // this.timer = setInterval(()=> this.getSparkLines(), 5000)
   }




  getUserKeys = async () => {
    let userKey = '';
    try {
      userKey = await AsyncStorage.getItem('userKey');
      this.setState({
        userKey: userKey,
        userKeysLoading: false,
      })
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
  }

  saveUserKeys = async userKey => {
    // close the overlay on button add and add this to the state
    this.setState({overlayOpend: false, userKey: this.state.search})
    try {
      await AsyncStorage.setItem('userKey', this.state.search);
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
  };

  deleteUserId = async () => {
    try {
      await AsyncStorage.removeItem('userKey');
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
  }


  async getWalletInfos(){

   fetch(`https://api.ethplorer.io/getAddressInfo/${this.state.userKey}?apiKey=EK-erqGt-bkX6JA5-wCyCS`)
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson)
      this.setState({
        walletInfos: responseJson,
        isLoading: false,
      });

    })
    .catch((error) =>{
      console.error(error);
    });

  }



  // update text input field
  updateSearch = search => {
    this.setState({ search });
  }





  render(){

    // if infos are still loading
    if(this.state.isLoading && this.state.userKeysLoading){
      return(
        <View style={{flex: 1, paddingTop: 200}}>
          <ActivityIndicator/>
        </View>
        )
    }

    const walletInfos = this.state.walletInfos;

    return (
      <ScrollView style={styles.container}>
        <View style={styles.homeHeader}>
          <Text>This is for wallet infos</Text>
          <Text>{this.state.userKey}</Text>
          <Text>{//walletInfos
          }</Text>
        </View>

        <Button title="Add Wallet Adress" onPress={() => {this.setState({overlayOpend: true})}} />
{
  // Overlay for adding infos
}
        <Overlay overlayStyle={{height:'auto',justifyContent:'center'}} isVisible={this.state.overlayOpend}>
          <View>
            <SearchBar
              placeholder="Put Wallet Adress"
              onChangeText={this.updateSearch}
              value={this.state.search}
              containerStyle={{backgroundColor: 'transparent', borderWidth: 0, shadowColor: 'white', borderBottomColor: 'transparent', borderTopColor: 'transparent', marginBottom: 10, width: '85%'}}
              inputContainerStyle={{backgroundColor: '#f8f8f8', borderRadius: 20}}
            />
            <Text h4>lorem ipsum</Text>
            <Text style={{color:'red'}} h4>lorem ipsum</Text>
            <Text h4>lorem ipsum</Text>
            <Text h4>lorem ipsum</Text>
            <Button title="Add" onPress={ () => {this.saveUserKeys()} } />
          </View>
        </Overlay>
{
  // Overlay for adding infos END
}

      </ScrollView>
    );
  }
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
});
