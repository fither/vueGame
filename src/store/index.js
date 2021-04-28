import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userName: String,
    userPassword: String,
    loggedIn: false,
    curScene: 'LoginWrapper',
    socket: io("http://localhost:3000")
  },
  mutations: {
    login: (state, playerInfo) => {
      state.userName = playerInfo.playerName;
      state.userPassword = playerInfo.playerPassword;
      state.loggedIn = true;
    },
    logout: state => {
      state.userName = "";
      state.userPassword = "";
      state.loggedIn = false;
    },
    changeScene: (state, sceneName) => {
      state.curScene = sceneName;
    }
  },
  getters: {
    getLoginStatus: state => {
      return state.loggedIn;
    },
    getCurrentScene: state => {
      return state.curScene;
    },
    getPlayerName: state => {
      return state.userName;
    },
    getPlayerPassword: state => {
      return state.userPassword;
    },
    getSocket: state => {
      return state.socket;
    }
  },
  actions: {
  },
  modules: {
  }
})
