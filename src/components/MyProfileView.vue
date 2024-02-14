<template>
  <div class="my-profile-container">

    <!-- Flex container for Equipment, Stats, and Skills sections -->
    <div class="profile-sections-container">

      <!-- Equipment Section -->
      <div class="profile-section">
        <h3>Equipment</h3>
        <table class="equipment-table">
          <tbody>
            <tr v-for="(item, index) in equipment" :key="index">
              <td class="equipment-slot-name">{{ item.slot }}</td>
              <td><ItemDisplay :item="item.equipment" :showTooltip="!!item.equipment" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Stats Section -->
      <div class="profile-section">
        <h3>Stats</h3>
        <p>Money: {{ userMoneyFormatted }}</p>
        <p>Joined: {{ joinDate }}</p>
        <div v-for="(attribute, index) in localUserRef._parsed.attributes" :key="index">
          <strong>{{ attribute.value }}</strong> {{ attribute.name }}
        </div>
      </div>

      <!-- Skills Section -->
      <div class="profile-section skills-section">
        <h3>Skills</h3>
        <div v-for="(skillLevel, index) in skillLevels.filter((x) => x.level > 0)" :key="index">
          <p>{{ skillLevel.skill.name }} {{ localToRomanNumerals(skillLevel.level) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { equipmentSlots } from '@/resources';
import { formatNumber, toRomanNumerals } from '@/utils';
import { getUserRef } from '../main';
import ItemDisplay from './ItemDisplay.vue';

export default {
  components: {
    ItemDisplay,
  },
  data() {
    return {
      localUserRef: getUserRef(),
    };
  },
  computed: {
    equipment() {
      if (!this.localUserRef) return [];
      const userEquipment = this.localUserRef._parsed.equipment;
      const computedEquipment = [];
      for (let index = 0; index < userEquipment.length; index++) {
        const equipment = userEquipment[index];
        computedEquipment[index] = { slot: equipmentSlots[index], equipment: equipment ? equipment : undefined };
      }
      return computedEquipment;
    },
    money() {
      return this.localUserRef ? this.localUserRef._parsed.money : undefined;
    },
    networth() {
      return this.localUserRef ? this.localUserRef._parsed.money : undefined;
    },
    joinDate() {
      return this.localUserRef ? this.localUserRef._parsed.joinDate.toDateString() : undefined;
    },
    skillLevels() {
      return this.localUserRef ? this.localUserRef._parsed.skills : {};
    },
    userMoneyFormatted() {
      if (!this.money) return '';
      return formatNumber(this.money);
    },
  },
  methods: {
    localToRomanNumerals(number) {
      return toRomanNumerals(number);
    }
  }
};
</script>

<style scoped>

.my-profile-container {
  text-align: center;
}

.profile-sections-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.profile-section {
  width: 30%; /* Adjust the width as needed */
  border: 1px solid #ddd; /* Add a border for separation */
  padding: 10px;
  box-sizing: border-box;
}

.equipment-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.equipment-table td {
  padding: 10px;
  border: none; /* Remove border lines */
}

.equipment-slot-name {
  font-weight: bold;
}

.skills-section {
  margin-left: 20px; /* Add space between Stats and Skills sections */
}

/* Additional styling as needed */

</style>