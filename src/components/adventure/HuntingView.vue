<template>
    <div class="hunting-view">
        <div class="hunting-results" v-if="turnIndex === data.turns.length">
            <h2 v-if="data.defeatedCreature">Successful Hunt!</h2>
            <h2 v-if="!data.defeatedCreature">Failed Hunt</h2>
            <div v-if="data.levelUp !== -1">
                <h3>Hunting Level Up!</h3>
                <h2>{{ localToRomanNumerals(data.levelUp - 1) }} >> {{ localToRomanNumerals(data.levelUp) }}</h2>
            </div>
            <p>{{ battleMessage }}</p>
            <p v-if="data.defeatedCreature">Rest for {{ localFormatTimeAmount(Math.ceil(data.coolDown / 1000)) }}</p>
            <p v-if="data.defeatedCreature">Remaining Health: <strong>{{ currentTurn.userHealth }}</strong></p>
            <p v-if="!data.defeatedCreature">{{ creature.name }}'s Remaining Health: <strong>{{ currentTurn.creaureHealth }}</strong></p>
            <p>Gained exp: <strong>{{ data.expGained }}</strong></p>
            <p>Total hunting loot value: <strong>{{ data.totalValue }}</strong></p>
            <h2>Items Gained:</h2>
            <div class="item-results">
            <div
                v-for="([item, amount], index) in parsedItems"
                :key="index"
                class="hunting-item"
            >
                <ItemDisplay :item="item" :amount="amount" class="item-display" />
            </div>
            </div>
            <button @click="reset()" class="simple-button">Great!</button>
        </div>
        <div class="hunting-turns" v-else>
            <h3>Your Health: {{ currentTurn.userHealth }} <span class="red" v-if="currentTurn.userDamaged">-{{ currentTurn.damage }}</span></h3>
            <h3>{{ creature.name }}'s Health: {{ currentTurn.creatureHealth }} <span class="red" v-if="currentTurn.creatureDamaged">-{{ currentTurn.damage }}</span></h3>
            <h4 v-if="currentTurn.userDamaged">{{ creature.name }} attacks and deals {{ currentTurn.damage }} damage to you</h4>
            <h4 v-if="currentTurn.creatureDamaged">You attack and deal {{ currentTurn.damage }} damage to {{ creature.name }}</h4>
            <h4 v-if="turnIndex === -1">You prepare for battle against {{ creature.name }}</h4>
            <img :src="`assets/${creature.id}.png`" class="creature-img"/>
            <button @click="nextTurn()" class="simple-button">Next</button>
        </div>
    </div>
  </template>
  
  <script>
  import { parseItem, getCreatureById } from '@/resources';
  import { toRomanNumerals, formatTimeAmount } from '@/utils';
  import { getUserRef } from '@/main';
  import ItemDisplay from '../ItemDisplay.vue';
  
  export default {
      data() {
          return {
              localUserRef: getUserRef(),
              turnIndex: -1,
              userHealth: null,
              creatureHealth: null,
          }
      },
      created() {
        this.userHealth = this.data.startHealth;
        this.creatureHealth = this.data.startCreatureHealth;
      },
      components: {
          ItemDisplay,
      },
      props: {
          data: {
              type: Object,
              required: true,
          },
      },
      computed: {
          parsedItems() {
              return !this.data ? null :
                  this.data.items.map((pair) => [ parseItem(pair[0]), pair[1] ]);
  
          },
          currentTurn() {
            if (this.turnIndex === -1) return {
                userHealth: this.data.startHealth,
                creatureHealth: this.data.startCreatureHealth,
                userDamaged: false,
                creatureDamaged: false,
                damage: 0,
            };
            return {
                userHealth: this.userHealth,
                creatureHealth: this.creatureHealth,
                userDamaged: this.data.turns[this.turnIndex] < 0,
                creatureDamaged: this.data.turns[this.turnIndex] > 0,
                damage: Math.abs(this.data.turns[this.turnIndex]),
            };
          },
          creature() {
            return getCreatureById(this.data.creature);
          },
          battleMessage() {
            if (!this.data.defeatedCreature) {
                return 'You got overpowered. You need rest before you can try again'
            }
            const index = this.data.coolDown / 5000;
            if (index < 3)
                return 'You defeated it, no sweat!';
            if (index < 4)
                return 'You defeated it with relative ease';
            if (index < 6)
                return 'You fought strongly and defeated it, but need rest';
            return 'You won the battle, it was tough, you went home to rest';
          }
      },
      methods: {
          localToRomanNumerals(number) {
              return toRomanNumerals(number);
          },
          localFormatTimeAmount(seconds) {
              return formatTimeAmount(seconds);
          },
          reset() {
              this.$emit('reset');
          },
          nextTurn() {
            this.turnIndex++;
            if (this.currentTurn.userDamaged) {
                this.userHealth -= this.currentTurn.damage;
                if (this.userHealth < 0) this.userHealth = 0;
            } else if (this.currentTurn.creatureDamaged) {
                this.creatureHealth -= this.currentTurn.damage;
                if (this.creatureHealth < 0) this.creatureHealth = 0;
            }
          }
      }
  };
  </script>
  
  <style scoped>
  .hunting-view {
    margin: 20px;
    margin-left: 25%;
    margin-right: 25%;
    border: 2px solid #ccc;
    background-color: #eee;
    padding: 20px;
    display: flex;
    flex-direction: column; 
    text-align: center; 
}

.item-results {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: space-around;
}

.mining-item > div {
  flex-basis: calc(15% - 5px);
}

.hunting-item {
  margin: 10px;
}

.creature-img {
    margin: 20px;
    width: 30%;
}

.simple-button {
    width: 100%;
}
  </style>
  