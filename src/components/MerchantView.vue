<template>
    <div class="merchant-view">
      <h3><i>{{ worldName }}</i></h3>
      <div class="merchant-items">
        <div v-for="merchantItem in merchantItems" :key="merchantItem.id" class="merchant-item">
          <div class="item-display-wrapper">
            <ItemDisplay :item="merchantItem.item" class="item-display"
            :additionalDetail="'In Inventory: ' + localUserRef._parsed.getItemAmount(merchantItem.item)"/>
          </div>
          <p>Price: {{ merchantItem.price }}$</p>
          <button 
            class="simple-button" 
            @click="buyItem(merchantItem)"
            :disabled="localUserRef._parsed.money < merchantItem.price || this.isLoading"
          >Buy Item</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { callEndpoint, getUserRef, setUser } from '@/main';
  import ItemDisplay from './ItemDisplay.vue';
  
  export default {
    components: {
      ItemDisplay,
    },
    data() {
      return {
        localUserRef: getUserRef(),
        isLoading: false
      };
    },
    computed: {
      merchantItems() {
        return this.localUserRef ? this.localUserRef._parsed.world._parsed.merchantItems : [];
      },
      worldName() {
        return this.localUserRef ? this.localUserRef._parsed.world.name : null;
      }
    },
    methods: {
      buyItem(merchantItem) {
        if (this.localUserRef._parsed.money < merchantItem.price || this.isLoading) return;
        this.isLoading = true;
        callEndpoint("merchant", "POST", { id: merchantItem.id, amount: 1 })
        .then((user) => {
          setUser(user);
          this.isLoading = false;
        })
        .catch((error) => {
          console.warn("Error when buying from merchant: " + error);
          this.isLoading = false;
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .merchant-view {
    margin: 20px;
  }
  
  .merchant-item {
    border: 1px solid #ccc;
    background-color: rgb(238, 238, 238);
    padding: 10px;
    margin-bottom: 30px;
    margin-left: auto;
    margin-right: auto;
    width: 60%; /* Adjust the width as needed */
  }
  
  .item-display-wrapper {
    display: flex;
    justify-content: center;
    margin: 20px;
  }
  
  .item-display {
    width: 20%; /* Adjust the width of the ItemDisplay component */
  }
  </style>
  