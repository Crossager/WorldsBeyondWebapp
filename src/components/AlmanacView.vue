<template>
  <div class="almanac-view">
    <div class="almanac-options">
      <!-- Buttons to select options -->
      <button
        @click="selectedOption = 'items'"
        :disabled="selectedOption === 'items'"
        class="simple-button"
      >
        Items
      </button>
      <button
        @click="selectedOption = 'fullSetBonuses'"
        :disabled="selectedOption === 'fullSetBonuses'"
        class="simple-button"
      >
        Full Set Bonuses
      </button>
      <button
        @click="selectedOption = 'creatures'"
        :disabled="selectedOption === 'creatures'"
        class="simple-button"
      >
        Creatures
      </button>
      <button
        @click="selectedOption = 'worlds'"
        :disabled="selectedOption === 'worlds'"
        class="simple-button"
      >
        Worlds
      </button>
      <!-- <button
        @click="selectedOption = 'enchantments'"
        :disabled="selectedOption === 'enchantments'"
        class="simple-button"
      >
        Enchantments
      </button> -->
    </div>
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search..."
      class="search-bar"
    />

    <!-- Search bar -->

    <!-- Display overview based on selected option -->
    <div class="overview">
      <template v-if="selectedOption === 'items'">
        <h2>Items Overview</h2>
        <div class="item-overview">
          <!-- Display overview of items -->
          <div
            v-for="(item, index) in filteredItems(
              'items',
              (item) => item.itemDisplay.name
            )"
            :key="index"
          >
            <!-- Display item details -->
            <ItemDisplay
              :item="item"
              :additionalTooltip="
                item._parsed.itemType.properties[0] !== -1
                  ? `Salvage price: ${item._parsed.itemType.properties[0]}$`
                  : undefined
              "
            />
          </div>
        </div>
      </template>

      <template v-else-if="selectedOption === 'fullSetBonuses'">
        <h2>Full Set Bonuses Overview</h2>
        <!-- Display overview of full set bonuses -->
        <div
          v-for="(bonus, index) in filteredItems('fullSetBonuses')"
          :key="index"
          class="full-set-bonus"
        >
          <!-- Display full set bonus details -->
          <h3>{{ bonus.name }}</h3>
          <table>
            <tr>
              <template v-for="(item, index) in bonus._parsed.fullSet">
                <td
                  v-if="item.equipment"
                  :style="`width: ${1 / bonus._parsed.pieceCount}%;`"
                  :key="index"
                >
                  <p>{{ item.slot }}</p>
                </td>
              </template>
            </tr>
            <tr>
              <template v-for="(item, index) in bonus._parsed.fullSet">
                <td
                  v-if="item.equipment"
                  :key="index"
                  :style="`width: ${1 / bonus._parsed.pieceCount}%;`"
                >
                  <ItemDisplay :item="item.equipment" />
                </td>
              </template>
            </tr>
          </table>
          <p
            v-for="(attribute, idx) in bonus._parsed.attributeBonus.filter(
              (attr) => attr.value > 0
            )"
            :key="idx"
          >
            {{ attribute.name }}: {{ attribute.value }}
          </p>
        </div>
      </template>

      <template v-if="selectedOption === 'creatures'">
        <h2>Creatures Overview</h2>
        <!-- Display overview of creatures -->
        <div
          v-for="(creature, index) in filteredItems('creatures')"
          :key="index"
        >
          <!-- Display creature details -->
          <div class="creature-info">
            <img :src="`assets/${creature.id}.png`" class="creature-img" />
            <div class="creature-details">
              <h3>{{ creature.name }}</h3>
              <p>
                <i>{{ getAggressivenessString(creature.chanceToAttack) }}</i>
              </p>
              <p>Health: {{ creature.health }}</p>
              <p>Attack Damage: {{ creature.attackDamage }}</p>
              <h3 v-if="creature._parsed.loot.length > 0">Loot</h3>
              <div class="small-item-display">
                <div
                  v-for="(item, index) in creature._parsed.loot"
                  :key="index"
                >
                  <ItemDisplay :item="item" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-if="selectedOption === 'worlds'">
        <h2>Worlds Overview</h2>
        <!-- Display overview of worlds -->
        <div v-for="(world, index) in filteredItems('worlds')" :key="index">
          <!-- Display world details -->
          <div class="world-info">
            <h2>{{ world.name }}</h2>
            <img :src="`assets/${world.id}.png`" class="world-img" />
            <div
              style="
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
              "
            >
              <div class="loot-section" v-if="world._parsed.miningLootItems.length > 0">
                <h4>Mining Loot Items</h4>
                <div class="small-item-display">
                  <div
                    v-for="(item, index) in world._parsed.miningLootItems"
                    :key="index"
                  >
                    <ItemDisplay :item="item" />
                  </div>
                </div>
              </div>
              <div class="loot-section" v-if="world._parsed.fishingTreasureItems.length > 0 || world._parsed.fishingGarbageItems.length > 0">
                <h4>Fishing Loot Items</h4>
                <div class="small-item-display">
                  <div
                    v-for="(
                      item, index
                    ) in world._parsed.fishingTreasureItems.concat(
                      world._parsed.fishingGarbageItems
                    )"
                    :key="index"
                  >
                    <ItemDisplay :item="item" />
                  </div>
                </div>
              </div>
              <div class="loot-section" v-if="world._parsed.creatures.length > 0">
                <h4>Creatures</h4>
                <div
                  v-for="(creature, index) in world._parsed.creatures"
                  :key="index"
                  style="display: flex; justify-content: space-around"
                >
                  <img
                    :src="`assets/${creature.id}.png`"
                    class="small-creature-img"
                  />
                  <p>
                    <strong>{{ creature.name }}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="selectedOption === 'enchantments'">
        <h2>Enchantments Overview</h2>
        <!-- Display overview of enchantments -->
        <div
          v-for="(enchantment, index) in filteredItems('enchantments')"
          :key="index"
        >
          <!-- Display enchantment details -->
          <p>{{ enchantment.name }} - {{ enchantment.description }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
// Import necessary resources
import {
  items,
  fullSetBonuses,
  creatures,
  worlds,
  enchantments,
  parseItem,
} from "@/resources";
import ItemDisplay from "./ItemDisplay.vue";

export default {
  data() {
    return {
      selectedOption: "items",
      items: items.map((item) => parseItem(item.id)),
      fullSetBonuses: fullSetBonuses.slice(1), // slice to remove none element
      creatures: creatures,
      worlds: worlds,
      enchantments: enchantments,
      searchQuery: "",
    };
  },
  methods: {
    // Filter items based on selected option and search query
    filteredItems(option, itemName = (item) => item.name) {
      const filteredData = this[option].filter((item) =>
        itemName(item).toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      return filteredData;
    },
    getAggressivenessString(chanceToAttack) {
      if (chanceToAttack == 0) return "Harmless";
      else if (chanceToAttack < 0.2) return "Peaceful";
      else if (chanceToAttack < 0.4) return "Slightly aggressive";
      else if (chanceToAttack < 0.6) return "Moderately aggressive";
      else if (chanceToAttack < 0.8) return "Aggressive";
      else return "Very aggressive";
    },

    // Get formatted string for merchant items
    getMerchantItems(merchantItems) {
      console.log(merchantItems);
      return merchantItems
        .map((item) => `${item.item.itemDisplay.name} ($${item.price})`)
        .join(", ");
    },
  },
  components: { ItemDisplay },
};
</script>

<style scoped>
/* Add styling for almanac view */
.almanac-view {
  margin: 20px;
}

/* Styling for option buttons */
.almanac-options {
  justify-content: space-around;
  display: flex;
  margin-left: 25%;
  margin-right: 25%;
}

.almanac-options button {
  width: 25%;
  margin: 3px;
}

/* Styling for search bar */
.search-bar {
  margin-top: 10px;
  width: 30%;
  padding: 8px;
  font-size: 14px;
  text-align: center;
  font: 1em sans-serif;
}

/* Styling for overview */
.overview {
  margin: 20px;
  margin-bottom: 100px;
}

.item-overview {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  gap: 5px;
}
.item-overview > div {
  flex-basis: calc(230px);
}
.full-set-bonus {
  margin: 20px;
  margin-left: 15%;
  margin-right: 15%;
  border: 2px solid #ccc;
}
.creature-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  margin-left: 15%;
  margin-right: 15%;
  border: 2px solid #ccc;
}
.creature-img {
  width: 250px;
  margin: 60px;
  margin-right: 20px;
}
.creature-details {
  flex: 1;
}

.small-item-display {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.small-item-display > div {
  flex-basis: calc(50px);
}
.world-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 20px;
  margin-left: 15%;
  margin-right: 15%;
  border: 2px solid #ccc;
  padding: 10px;
}
.loot-section {
  border: 2px solid #ccc;
  width: calc(50% - 10px);
  padding-bottom: 5px;
}

.world-img {
  width: 200px;
  margin: 60px;
  margin-right: 20px;
}
.small-creature-img {
  width: 70px;
}
</style>
