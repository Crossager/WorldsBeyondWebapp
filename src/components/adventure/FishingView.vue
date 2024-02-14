<template>
  <div class="fishing-view">
    <h2>Fishing Results</h2>
    <div v-if="data.levelUp !== -1">
        <h3>Fishing Level Up!</h3>
        <h2>{{ localToRomanNumerals(data.levelUp - 1) }} >> {{ localToRomanNumerals(data.levelUp) }}</h2>
    </div>
    <p>Fishing Fortune: <strong>{{ localUserRef.attributes[1] }}</strong></p>
    <p>Bonus Fishing Fortune: <strong>+{{ data.attribute - localUserRef.attributes[1] }}</strong> ({{ data.attribute }})</p>
    <p>Gained exp: <strong>{{ data.expGained }}</strong></p>
    <p>Total fishing result value: <strong>{{ data.totalValue }}</strong></p>
    <h2>Items Gained:</h2>
    <div class="item-results">
      <div
        v-for="([item, amount], index) in parsedItems"
        :key="index"
        class="fishing-item"
      >
        <ItemDisplay :item="item" :amount="amount" class="item-display" />
      </div>
    </div>
    <button @click="reset()" class="simple-button">Great!</button>
  </div>
</template>

<script>
import { parseItem } from '@/resources';
import { toRomanNumerals } from '@/utils';
import { getUserRef } from '@/main';
import ItemDisplay from '../ItemDisplay.vue';

export default {
    data() {
        return {
            localUserRef: getUserRef(),
        }
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

        }
    },
    methods: {
        localToRomanNumerals(number) {
            return toRomanNumerals(number);
        },
        reset() {
            this.$emit('reset');
        },
    }
};
</script>

<style scoped>
.fishing-view {
  margin: 20px;
  margin-left: 25%;
  margin-right: 25%;
  border: 2px solid #ccc;
  background-color: #eee;
  padding: 20px;
}

.item-results {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: space-around;
}

.item-results > div {
  flex-basis: calc(15% - 5px);
}

.fishing-item {
  margin: 10px;
}

.simple-button {
    width: 100%;
}
</style>
