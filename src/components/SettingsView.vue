<template>
    <div class="settings-view">
      <p>Copying the token allows you to login on a different device and still keep all your progress. Keep the token safe, if someone gets their hands on it they will have access to your account. If you lose the token there is no way to recover your account, keep it safe.</p>
      <button @click="copyTokenToClipboard" class="simple-button">Copy Token</button>
      <button @click="confirmLogout" class="simple-button">Logout</button>
      <div v-if="showLogoutConfirmation" class="logout-confirmation">
        <p>Are you sure you want to logout?</p>
        <button @click="logoutUser" class="simple-button confirm-button">Yes</button>
        <button @click="cancelLogout" class="simple-button cancel-button">Cancel</button>
      </div>
    </div>
  </template>
  
  <script>
  import { setCookie, getToken } from '@/main';
  
  export default {
    data() {
      return {
        showLogoutConfirmation: false
      };
    },
    methods: {
      copyTokenToClipboard() {
        const token = getToken();
        navigator.clipboard.writeText(token).then(() => {
          alert("Token copied to clipboard!");
        }).catch((error) => {
          console.error("Failed to copy token: ", error);
        });
      },
      confirmLogout() {
        this.showLogoutConfirmation = true;
      },
      cancelLogout() {
        this.showLogoutConfirmation = false;
      },
      logoutUser() {
        setCookie('gametoken', '', 0);
        window.location.reload();
      }
    }
  };
  </script>
  
  <style scoped>
  .settings-view {
    margin: 40px;
    margin-left: 15%;
    margin-right: 15%;
  }
  
  .simple-button {
    margin-right: 10px;
  }
  
  .logout-confirmation {
    margin-top: 20px;
  }
  
  .confirm-button {
    margin-right: 10px;
    background-color: rgb(228, 56, 56);
  }
  .confirm-button:hover {
    background-color: rgb(133, 33, 33);
  }
  .cancel-button {
    background-color: #aaa;
  }
  .cancel-button:hover {
    background-color: #888;
  }
  </style>
  