<template>
  <div class="enchantment-view">
    <div class="equipment-container">
      <h2>Equipment</h2>
      <table class="equipment-table">
        <tbody>
          <tr v-for="(item, index) in equipment" :key="index">
            <td class="equipment-slot-name">{{ item.slot }}</td>
            <td
              :style="
                index === selectedEquipmentIndex
                  ? 'background-color: #3498db;'
                  : ''
              "
            >
              <ItemDisplay
                :item="item.equipment"
                :showTooltip="!!item.equipment"
                :itemClick="() => selectEquipment(index)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="selectedItem" class="enchantment-selector">
      <h2>Enchantment Selector</h2>
      <div class="enchantment-type">
        <button
          @click="selectEnchantmentType('Basic')"
          :disabled="isEnchanting"
          class="simple-button"
        >
          Basic Enchantments
        </button>
        <button
          @click="selectEnchantmentType('Rare')"
          :disabled="isEnchanting"
          class="simple-button"
        >
          Rare Enchantments
        </button>
      </div>
      <h3
        for="enchantment-level"
        :style="selectedEnchantment ? '' : 'opacity: 0%;'"
      >
        {{ selectedEnchantment ? selectedEnchantment.name : null }}
        {{ localToRomanNumerals(selectedLevel) }}
      </h3>
      <div class="level-selector">
        <button 
        v-for="(level, index) in enchantmentLevels" 
        :key="index"
        class="simple-button"
        :disabled="level === selectedLevel"
        :style="(selectedEnchantment ? '' : 'opacity: 0%;') + 'width:100%;'"
        @click="selectedLevel = level">{{ localToRomanNumerals(level) }}</button>
      </div>
      <p v-if="availableEnchantments.length === 0">
        <i>No enchantments available</i>
      </p>
      <div
        class="enchantment-option"
        v-for="enchantment in availableEnchantments"
        :key="enchantment.id"
      >
        <input
          type="radio"
          :id="'enchantment-' + enchantment.id"
          :value="enchantment.id"
          v-model="selectedEnchantmentId"
        />
        <label :for="'enchantment-' + enchantment.id">{{
          enchantment.name
        }}</label>
      </div>
      <button 
        class="simple-button disenchant-button" 
        @click="disenchantItem()" 
        :disabled="selectedItem.enchantmentSet.length === 0">Disenchant Item</button>
    </div>

    <!-- Display selected enchantment description and cost -->
    <div v-if="selectedEnchantment" class="enchantment-details">
      <h2>Enchantment Details</h2>
      <h3>{{ selectedEnchantment.name }}</h3>
      <p>{{ selectedEnchantment.description }}</p>
      <h3>Enchantment Cost</h3>
      <p
        :style="
          localUserRef._parsed.money <
          calculateEnchantmentCost(selectedEnchantment.cost, selectedLevel)
            ? 'color:red'
            : ''
        "
      >
        Money:
        {{ calculateEnchantmentCost(selectedEnchantment.cost, selectedLevel) }}$
      </p>
      <div class="item-grid">
        <div
          v-for="(cost, index) in selectedEnchantment._parsed.itemCost"
          :key="index"
        >
          <ItemDisplay
            :item="cost[0]"
            :amount="calculateEnchantmentCost(cost[1], selectedLevel)"
            :showTooltip="false"
            :additionalDetail="
              getInventoryAmountText(
                cost[0],
                calculateEnchantmentCost(cost[1], selectedLevel)
              )
            "
          />
        </div>
      </div>
      <div
        v-if="selectedEnchantment && enchantedResult"
        class="enchantment-results"
      >
        <h3>Enchanted Item</h3>
        <p v-if="oldEnchantment" class="red">Enchanting will override previous enchantment in this category!</p>
        <ItemDisplay :item="enchantedResult" />
        <br />
        <button
          @click="enchantItem"
          :disabled="isEnchantingDisabled || !canEnchantItem"
          class="simple-button"
        >
          Enchant
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { callEndpoint, getUserRef, setUser } from "@/main";
import { toRomanNumerals } from "@/utils";
import { toRaw } from "vue";
import {
  enchantments,
  getEnchantmentById,
  equipmentSlots,
  parseItem,
  enchantmentTypes,
  internalEquipmentSlots,
} from "../resources.js";
import ItemDisplay from "./ItemDisplay.vue";
export default {
  components: {
    ItemDisplay,
  },
  data() {
    return {
      selectedEnchantmentId: null,
      isEnchanting: false,
      selectedEnchantmentType: "Basic",
      localEnchantmentTypes: enchantmentTypes,
      selectedLevel: 1,
      selectedEquipmentIndex: -1,
      localUserRef: getUserRef(),
    };
  },
  watch: {
    selectedEnchantmentId(newVal) {
      this.selectedLevel = 1;
    },
    selectedItem(newVal) {
      this.selectedLevel = 1;
      this.selectedEnchantmentId = null;
    },
  },
  computed: {
    selectedEnchantment() {
      return getEnchantmentById(this.selectedEnchantmentId);
    },
    isEnchantingDisabled() {
      return this.isEnchanting || !this.selectedEnchantment;
    },
    availableEnchantments() {
      return enchantments.filter((enchantment) =>
        this.isEnchantmentApplicableToItem(enchantment)
      );
    },
    equipment() {
      if (!this.localUserRef) return [];
      const userEquipment = this.localUserRef._parsed.equipment;
      const computedEquipment = [];
      for (let index = 0; index < userEquipment.length; index++) {
        const equipment = userEquipment[index];
        computedEquipment[index] = {
          slot: equipmentSlots[index],
          equipment: equipment ? equipment : undefined,
        };
      }
      return computedEquipment;
    },
    selectedItem() {
      const equipment = this.equipment[this.selectedEquipmentIndex];
      return equipment ? equipment.equipment : null;
    },
    canEnchantItem() {
      const baseCost = this.calculateEnchantmentCost(1, this.selectedLevel);

      return (
        this.localUserRef._parsed.containsItems(
          this.selectedEnchantment._parsed.itemCost,
          baseCost
        ) &&
        this.localUserRef._parsed.money >=
          this.selectedEnchantment.cost * baseCost
      );
    },
    oldEnchantment() {
      return this.selectedItem.enchantmentSet.find(
          (entry) =>
            entry.type ===
            this.localEnchantmentTypes.indexOf(this.selectedEnchantmentType)
        )
    },
    enchantedResult() {
      const item = { ...toRaw(this.selectedItem) };
      item.enchantmentSet = [
        ...item.enchantmentSet.filter(
          (entry) =>
            entry.type !==
            this.localEnchantmentTypes.indexOf(this.selectedEnchantmentType)
        ),
      ];
      item.enchantmentSet.push({
        enchantment: this.selectedEnchantment.id,
        type: this.localEnchantmentTypes.indexOf(this.selectedEnchantmentType),
        level: this.selectedLevel,
      });
      const parsedItem = parseItem(item, true);
      return parsedItem;
    },
    enchantmentLevels() {
      const levels = [];
      for (
        let i = 0;
        i < (this.selectedEnchantment ? this.selectedEnchantment.maxLevel : 1);
        i++
      ) {
        levels.push(i + 1);
      }
      return levels;
    },
  },
  methods: {
    disenchantItem() {
      const data = {
        equipmentSlot: internalEquipmentSlots[this.selectedEquipmentIndex],
      };
      callEndpoint("disenchant", "POST", data)
        .then((user) => {
          setUser(user);
        })
        .catch((error) => {
          console.warn("Error when disenchanting: " + error);
          this.isEnchanting = false;
        });
    },
    selectEquipment(index) {
      if (!this.equipment[index].equipment) return;
      if (this.selectedEquipmentIndex === index) {
        this.selectedEquipmentIndex = -1;
      } else {
        this.selectedEquipmentIndex = index;
      }
    },

    localToRomanNumerals(number) {
      return toRomanNumerals(number);
    },

    selectEnchantmentType(type) {
      this.selectedEnchantmentType = type;
    },

    calculateEnchantmentCost(baseCost, level) {
      return Math.pow(2, level - 1) * baseCost;
    },

    isEnchantmentApplicableToItem(enchantment) {
      if (!this.selectedItem) return false;
      if (!enchantment) return false;
      if (!this.selectedItem._parsed.equipmentMeta) return false;
      const toolTypeMatch =
        enchantment.toolTypes &&
        enchantment.toolTypes.includes(
          this.selectedItem._parsed.equipmentMeta.toolType
        );
      const equipmentSlotMatch =
        enchantment.equipmentSlots &&
        enchantment.equipmentSlots.includes(
          this.selectedItem._parsed.equipmentMeta.equipmentSlot
        );

      return (
        this.localEnchantmentTypes[enchantment.enchantmentType] ===
          this.selectedEnchantmentType &&
        (toolTypeMatch || equipmentSlotMatch)
      );
    },
    getInventoryAmountText(item, requiredAmount) {
      const inventoryAmount = this.localUserRef._parsed.getItemAmount(item);
      return `<p style="${
        inventoryAmount < requiredAmount ? "color: red;" : ""
      }">In Inventory: ${inventoryAmount}</p>`;
    },
    enchantItem() {
      if (!this.canEnchantItem || this.isEnchanting) return;
      this.isEnchanting = true;
      const data = {
        enchantment: this.selectedEnchantment.id,
        level: this.selectedLevel,
        equipmentSlot: internalEquipmentSlots[this.selectedEquipmentIndex],
      };
      callEndpoint("enchant", "POST", data)
        .then((user) => {
          setUser(user);
          this.isEnchanting = false;
        })
        .catch((error) => {
          console.warn("Error when enchanting: " + error);
          this.isEnchanting = false;
        });
    },
  },
};
</script>

<style scoped>
.equipment-container {
  width: 30%;
  margin-top: -40px
}
.equipment-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  margin-right: 30px;
}

.equipment-table td {
  padding: 10px;
  border: none; /* Remove border lines */
}

.equipment-slot-name {
  font-weight: bold;
}

.enchantment-view {
  display: flex;
  margin-bottom: 400px;
}

.enchantment-details {
  flex: 1;
  width: 40%;
  height: min-content;
  position: relative;
}

.enchantment-results {
  margin-top: 15%;
  margin-left: -22%;
  height: min-content;
  position: absolute;
}

.enchantment-level-slider {
  width: 100%;
}

.disenchant-button {
  width: 50%;
  margin-top: 100px;
  background-color: rgb(255, 115, 0);
}

.disenchant-button:hover {
  background-color: rgb(155, 70, 0);
}

.enchantment-type {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.item-grid {
  column-gap: 10px;
  row-gap: 10px;
  flex-wrap: wrap;
  display: flex;
}

.item-grid > div {
  flex-basis: calc(50% - 10px); /* 50% width with 10px gap */
}

.enchantment-selector {
  margin-left: 20px;
  margin-right: 20px;
  width: 30%;
  height: min-content;
  position: relative;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  margin-top: -20px
}

.level-selector {
  display: flex;
  justify-content: space-between;
  margin-left: 12px;
  align-items: center;
}

.enchantment-option {
  margin-bottom: 10px;
  margin-top: 20px;
}

.enchantment-option label {
  display: inline-block;
  margin-right: 10px;
  font-weight: bold;
}

.enchantment-selector input[type="range"] {
  width: 100%;
  -webkit-appearance: none; /* Remove default styling */
  appearance: none;
  height: 10px; /* Customize the height */
  border-radius: 5px; /* Rounded corners */
  background: #d3d3d3; /* Grey background */
  outline: none; /* Remove default focus styling */
}

/* Styling for the thumb of the range input */
.enchantment-selector input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; /* Remove default styling */
  appearance: none;
  width: 20px; /* Customize the width */
  height: 20px; /* Customize the height */
  border-radius: 50%; /* Circular shape */
  background: #3498db; /* Blue background */
}

.enchantment-selector input[type="range"]:disabled::-webkit-slider-thumb {
  background: #bdc3c7; /* Grey out thumb when disabled */
}

/* Styling for radio buttons */
.enchantment-selector input[type="radio"] {
  display: none; /* Hide the default radio buttons */
}

/* Custom radio button style */
.enchantment-selector input[type="radio"] + label {
  display: inline-block;
  cursor: pointer;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
}

/* Styling for selected radio buttons */
.enchantment-selector input[type="radio"]:checked + label {
  background-color: #3498db;
  color: #fff;
}
</style>
