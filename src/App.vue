<script setup>
  import LoginScreen from './components/LoginScreen.vue'
  import GameView from './components/GameView.vue'
  import { isLoaded, caughtError } from './resources'
  import { setCookie, getCookie, setToken, callEndpoint, setUser } from './main'
  import { ref } from 'vue';

  const cookie = getCookie('gametoken');

  var showLoginScreen = ref(cookie == '');

  if (!showLoginScreen.value) {
    setToken(cookie);
    setCookie('gametoken', cookie, 999)
    callEndpoint('user', 'GET')
                .then((user) => {
                    setUser(user);
                })
                .catch(function (error) {
                    console.warn("Error logging in:", error);
                    showLoginScreen.value = true;
                });
  }

</script>

<template>
  <div id="app">
    <div v-if="caughtError===null">
      <LoginScreen v-if="showLoginScreen" @load="showLoginScreen = false"/>
      <GameView v-if="!showLoginScreen && isLoaded" />
    </div>
    <div id="server-error" v-if="caughtError !== null || !isLoaded">
      <h1>Error connecting to server</h1>
    </div>
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#server-error {
  color: red;
}
.simple-button {
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  background-color: #3498db;
  color: #fff;
  transition: background-color 0.3s ease;
}
.simple-button-disabled {
  padding: 10px;
  font-size: 16px;
  cursor: not-allowed;
  border: none;
  border-radius: 5px;
  background-color: #616161;
  color: #fff;
  transition: background-color 0.2s ease;
}
.simple-button:disabled {
  cursor: not-allowed;
  background-color: #616161;
  transition: background-color 0.2s ease;
}
.simple-button:disabled:hover {
  background-color: #616161;
}

.simple-button:hover {
  background-color: #2980b9;
}

.red {
  color: red;
}
</style>