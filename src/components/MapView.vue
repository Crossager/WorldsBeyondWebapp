<template>
    <div class="map-view">
      <div class="worlds-container">
        <div
          v-for="(world, index) in worldsToDisplay"
          :key="index"
          class="world"
          :style="`left:${getXOffset(index)}%;top:${worldHeight * index}px;z-index:${worldsToDisplay.length - index};` + (localUserRef.world === world.id ? 'border:5px solid yellow' : '')"
        >
          <img :style="!isUnlocked(world.id) ? 'filter:grayscale(100%)' : ''" class="world-image" :src="`assets/${world.id}.png`" />
          <h3>{{ world.name }}</h3>
          <button v-if="isUnlocked(world.id)" @click="travel(world.id)" :disabled="localUserRef.world === world.id || isLoading" class="simple-button">Travel Here</button>
          <div v-else v-if="world.id !== 'unknown'" class="world-cost">
            <button class="simple-button" :disabled="!canUnlock[index]" @click="unlock(world.id)">Unlock World</button>
            <div class="item-grid">
              <div
                v-for="(cost, index) in world._parsed.unlockCost"
                :key="index"
              >
                <ItemDisplay
                  :item="cost[0]"
                  :amount="cost[1]"
                  :showTooltip="false"
                  :additionalDetail="
                    getInventoryAmountText(
                      cost[0],
                      cost[1]
                    )
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-for="(trail, index) in trails" :key="index" class="trail" :style="{ top: trail.top + 'px', left: trail.left + '%'}"><br /></div>
    </div>
  </template>
  
  <script>
  import { callEndpoint, getUserRef } from '@/main';
  import { worlds } from '@/resources';
import ItemDisplay from './ItemDisplay.vue';
  export default {
    data() {
        return {
            localUserRef: getUserRef(),
            worldHeight: 600,
            trailOffset: 30,
            trailStart: 200,
            isLoading: false
        };
    },
    computed: {
        worldsToDisplay() {
            if (!this.localUserRef)
                return [];
            return [ ...worlds, { id: 'unknown', name: '???'} ];
        },
        trails() {
            const trails = [];
            for (let i = 0; i < this.worldsToDisplay.length * this.worldHeight - this.trailStart; i += this.trailOffset) {
              const trail = {
                top: i + this.trailStart,
                left: this.getXOffset((i + 6 * this.trailOffset) / this.worldHeight) + 10,
              }
              trails.push(trail);
            }
            return trails;
        },
        canUnlock() {
          const result = [];
          worlds.forEach(
            (world, index) => {
              result[index] = !this.isLoading && this.localUserRef._parsed.containsItems(world._parsed.unlockCost, 1);
            }
          );
          return result;
        },
    },
    methods: {
      getXOffset(index) {
        return (0.5 + Math.sin(index * this.worldHeight * 0.002 - 0.8) * 0.5) * 100;
      },
        isUnlocked(worldId) {
            return this.localUserRef.unlockedWorlds.includes(worldId);
        },
        travel(worldId) {
            if (this.isLoading)
                return;
            this.isLoading = true;
            callEndpoint('travel', 'POST', worldId)
                .then((user) => {
                setUser(user);
                this.isLoading = false;
            })
                .catch((error) => {
                console.warn("Error while traveling " + error.response.data);
                this.isLoading = false;
            });
        },
        unlock(worldId) {
            if (this.isLoading)
                return;
            this.isLoading = true;
            callEndpoint('unlock-world', 'POST', worldId)
                .then((user) => {
                setUser(user);
                this.isLoading = false;
            })
                .catch((error) => {
                console.warn("Error while unlocking " + error.response.data);
                this.isLoading = false;
            });
        },
      getInventoryAmountText(item, requiredAmount) {
        const inventoryAmount = this.localUserRef._parsed.getItemAmount(item);
        return `<p style="${
          inventoryAmount < requiredAmount ? "color: red;" : ""
        }">In Inventory: ${inventoryAmount}</p>`;
      },
    },
    components: { ItemDisplay }
};
  </script>
  
  <style scoped>
  .map-view {
    position: relative;
    margin-right: 15%;
    margin-top: 50px;
  }

  .world-cost {
    display: none;
    background-color: #fff;
    padding: 5px;
    border: 2px solid #ccc;
  }

  .world:hover .world-cost {
    display: block;
  }
  
  .item-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.item-grid > div {
  flex-basis: calc(50% - 10px); /* 50% width with 10px gap */
}
  
  .worlds-container {
    position: relative;
    margin-left: 150px;
    margin-right: 150px;
  }
  
  .world {
    position: absolute;
    align-items: center;
    width: 300px;
    color: black;
  }

  .world:hover {
    filter: brightness(90%); 
  }

  .world-image {
    width: 300px;
  }
  
  .trail {
    position: absolute;
    border-radius: 10px;
    background-color: rgb(129, 129, 129); /* Adjust styling as needed */
    width: 20px; /* Adjust as needed */
    z-index: -1;
  }
  </style>
  