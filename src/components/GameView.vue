<template>
  <div class="navBar">
    <div class="navbar-header">
      <img
        :src="`assets/${localUserRef ? localUserRef.world : 'unknown'}.png`"
        alt=""
        class="navbar-logo"
      />
      <h1 class="navbar-title">Worlds Beyond</h1>
    </div>
    <div class="money-display">
      <h3>
        <strong>Money: {{ userMoneyFormatted }}</strong>
      </h3>
    </div>
    <ul>
      <li v-for="menu in menus" :key="menu.key">
        <button
          :disabled="!localUserRef"
          @click="setCurrentMenu(menu.index)"
          class="simple-button"
        >
          {{ menu.display }}
        </button>
      </li>
    </ul>
  </div>
  <div class="view" v-if="localUserRef">
    <h1>{{ menus[currentMenuIndex].display }}</h1>
    <InventoryView v-if="currentMenu == 'inventory'" />
    <MyProfileView v-if="currentMenu == 'myprofile'" />
    <SkillsView v-if="currentMenu == 'skills'" />
    <CraftingView v-if="currentMenu == 'crafting'" />
    <EnchantmentView v-if="currentMenu == 'enchanting'" />
    <MerchantView v-if="currentMenu == 'merchant'" />
    <AdventureView v-if="currentMenu == 'adventure'" />
    <MapView v-if="currentMenu == 'map'" />
    <AlmanacView v-if="currentMenu == 'almanac'" />
    <SettingsView v-if="currentMenu == 'settings'" />
    <img
      v-if="localIsLoading()"
      :src="'icons/loading.gif'"
      alt="Loading"
      class="loading-icon"
    />
  </div>
</template>

<script>
import { getUserRef, isLoading } from "../main";
import { formatNumber } from "../utils";
import InventoryView from "./InventoryView.vue";
import MyProfileView from "./MyProfileView.vue";
import SkillsView from "./SkillsView.vue";
import CraftingView from "./CraftingView.vue";
import EnchantmentView from "./EnchantmentView.vue";
import MerchantView from "./MerchantView.vue";
import AdventureView from "./AdventureView.vue";
import MapView from "./MapView.vue";
import AlmanacView from "./AlmanacView.vue";
import SettingsView from "./SettingsView.vue";
export default {
  name: "GameView",
  components: {
    InventoryView,
    MyProfileView,
    SkillsView,
    CraftingView,
    EnchantmentView,
    MerchantView,
    AdventureView,
    MapView,
    AlmanacView,
    SettingsView
},
  data() {
    return {
      localUserRef: getUserRef(),
      currentMenuIndex: 0,
      menus: [
        { key: "myprofile", index: 0, display: "My Profile" },
        { key: "inventory", index: 1, display: "Inventory" },
        { key: "skills", index: 2, display: "Skills" },
        { key: "crafting", index: 3, display: "Crafting" },
        { key: "enchanting", index: 4, display: "Enchanting" },
        { key: "merchant", index: 5, display: "Merchant" },
        { key: "adventure", index: 6, display: "Adventure" },
        { key: "map", index: 7, display: "Map" },
        { key: "almanac", index: 8, display: "Almanac" },
        { key: "settings", index: 9, display: "Settings" },
      ],
    };
  },
  computed: {
    userMoneyFormatted() {
      if (!this.userMoney) return "";
      return formatNumber(this.userMoney);
    },
    currentMenu() {
      return this.menus[this.currentMenuIndex].key;
    },
    userMoney() {
      return this.localUserRef ? this.localUserRef._parsed.money : undefined;
    },
  },
  methods: {
    setCurrentMenu(index) {
      this.currentMenuIndex = index;
    },
    localIsLoading() {
      return isLoading();
    },
  },
};
</script>

<style scoped>
.navBar {
  width: 12vw;
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background-color: #333;
  padding: 15px;
  box-shadow: -5px 0 5px rgba(0, 0, 0, 0.1);
  margin-left: 88%;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
}

a {
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 16px;
  transition: color 0.3s;
}

a:hover {
  color: #ff9900;
}

.navbar-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.navbar-logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.navbar-title {
  font-size: 24px;
  color: #fff;
}

.simple-button {
  width: 100%;
}

.view {
  padding-right: 14vw;
}

.loading-icon {
  width: 100px;
}

.money-display {
  margin-left: auto;
  color: gold;
}
</style>
