<template>
  <div id="app">
    <component :is="this.$store.getters.getCurrentScene"></component>
  </div>
</template>

<script>
import LoginWrapper from './components/LoginWrapper';
import LobbyWrapper from './components/LobbyWrapper';
import BlockGame from './components/BlockGame';

export default {
  name: 'App',
  components: {
    LoginWrapper,
    LobbyWrapper,
    BlockGame
  },
  methods: {
    resizeWrapper() {

    }
  },
  computed: {
    loginStatus() {
      return this.$store.getters.getLoginStatus;
    }
  },
  data() {
    return {
      socket: {}
    }
  },
  created() {
    // this.resizeWrapper();
    // window.addEventListener('resize', this.resizeWrapper);
  },
  destroyed() {
    // window.removeEventListener('resize');
  }
}
</script>

<style lang="scss">
  // #app {
  //   position: absolute;
  //   left: 0%;
  //   top: 10%;
  //   background: black;
  //   outline: none;
  //   overflow: hidden;
  //   width: 100%;
  //   height: 80%;
  // }
</style>
