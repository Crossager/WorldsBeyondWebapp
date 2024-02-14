<template>
  <div class="skills-view">
    <div
      v-for="(skillInfo, index) in localUserRef._parsed.skills"
      :key="index"
      class="skill-container"
    >
      <div class="skill-info">
        <div v-if="skillInfo.totalExp === 0">
          <h2>Unknown Skill</h2>
          <p>Gather exp to learn more...</p>
        </div>
        <div v-if="skillInfo.totalExp !== 0">
            <h2 >{{ skillInfo.skill.name }}</h2>
            <h1>{{ localToRomanNumerals(skillInfo.level) }}</h1>
            <p>Experience: {{ skillInfo.exp }} / {{ skillInfo.expToLevelUp }}</p>
            <br/>
            <p>Total Experience: {{ skillInfo.totalExp }}</p>
        </div>
        
      </div>
      <div class="progress-bar-container" v-if="skillInfo.totalExp !== 0">
        <div
          class="progress-bar"
          :style="{
            width: progressBarWidth(skillInfo.exp, skillInfo.expToLevelUp),
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserRef } from "@/main";
import { toRomanNumerals } from "@/utils";

export default {
  data() {
    return {
      localUserRef: getUserRef(),
    };
  },
  methods: {
    progressBarWidth(currentExp, expToLevelUp) {
      const percentage = (currentExp / expToLevelUp) * 100;
      return `${percentage}%`;
    },
    localToRomanNumerals(number) {
      return toRomanNumerals(number);
    }
  },
};
</script>

<style scoped>
.skills-view {
  text-align: center;
  margin-left: 20%;
  margin-right: 20%;
}

.skill-container {
  border: 1px solid #ddd;
  margin-bottom: 20px;
  padding: 10px;
  box-sizing: border-box;
}

.skill-info {
  margin-bottom: 10px;
}

.progress-bar-container {
  height: 40px;
  background-color: #dbdbdb;
  border-radius: 5px;
  border: 2px solid rgb(63, 63, 63);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #3498db;
  transition: width 0.5s ease-in-out;
}
</style>
