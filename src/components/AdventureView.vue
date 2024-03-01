<template>
    <div class="adventure-view" v-if="!adventure">
      <h2>Choose Your Adventure</h2>
      <div class="adventure-buttons">
        <button
          v-for="(adventure, index) in adventures"
          :key="index"
          class="adventure-button"
          @click="startAdventure(adventure)"
          :disabled="!isAdventureAvailable(adventure)"
        >
          <img :src="adventure.image" alt="Adventure Image" class="adventure-image" />
          <div class="adventure-info">
            <h3>{{ adventure.title }}</h3>
            <p>{{ adventure.description }}</p>
            <p v-if="coolDownTexts[index]" class="red">
              Available {{ coolDownTexts[index] }}
            </p>
            <p v-if="!isSupported(adventure)" class="red">Not supported in this world</p>
            <p v-if="!hasEquipment(adventure)" class="red">Need special tool equipped for this</p>
          </div>
        </button>
      </div>
    </div>
    <MiningView :data="data" v-if="adventure === 'Mine'" @reset="reset()"/>
    <FishingView :data="data" v-if="adventure === 'Fish'" @reset="reset()"/>
    <HuntingView :data="data" v-if="adventure === 'Hunt'" @reset="reset()"/>
  </template>
  
  <script>
  import { callEndpoint, getUserRef, setUser, getEntity } from '@/main';
import { getTimeUntil, formatTimeUntil } from '@/utils';
import MiningView from './adventure/MiningView.vue'
import FishingView from './adventure/FishingView.vue'
import HuntingView from './adventure/HuntingView.vue'

  export default {
    components: {
        MiningView,
        FishingView,
        HuntingView
    },
    data() {
      return {
        localUserRef: getUserRef(),
        isLoading: false,
        data: null,
        adventure: null,  
        timer: "", 
        rndUpdate: 0,
        // Don't ask where the ids come from
        adventures: [
          {
            title: "Fish",
            endpoint: 'fish',
            description: 'Fish for sea creatures and the occasional treasure!',
            image: 'assets/classical_fishing_rod.png',
            cooldownId: 268435458,
            supportString: 'supportsFishing',
            toolType: 1
          },
          {
            title: "Mine",
            endpoint: 'mine',
            description: 'Mine for special ores and minerals deep down!',
            image: 'assets/stone_pickaxe.png',
            cooldownId: 268435457,
            supportString: 'supportsMining',
            toolType: 0
          },
          {
            title: "Hunt",
            endpoint: 'hunt',
            description: 'Hunt for exotic creatures in this world!',
            image: 'assets/gold_sword.png',
            cooldownId: 268435460,
            supportString: 'supportsHunting',
            toolType: 2
          },
        ],
      };
    },
    computed: {
        coolDownTexts() {
            this.rndUpdate;
            const arr = [];
            this.adventures.forEach((adventure) => {
                const timeUntil = this.getCooldown(adventure.cooldownId);
                if (timeUntil < 0) {
                    arr.push(undefined);
                } else {
                    arr.push(this.localFormatTimeUntil(timeUntil));
                }
            });
            return arr;
        }
    },
    created() {
        this.timer = setInterval(() => this.rndUpdate++, 500);  
    },
    beforeDestroy() {  
        clearInterval(this.timer);  
    }, 
    methods: {
        getCooldown(id) {
          if (!this.localUserRef) return -1;
           const coolDown = this.localUserRef.entityMap.filter((entity) => entity[0] === id)[0]
           if (!coolDown) return -1;
            return getTimeUntil(coolDown[1]);
        },
        localFormatTimeUntil(millis) {
            return formatTimeUntil(Math.ceil(millis / 1000));
        },
        isSupported(adventure) {
            if (!this.localUserRef) return false;
            return this.localUserRef._parsed.world._parsed[adventure.supportString];
        },
        hasEquipment(adventure) {
            if (!this.localUserRef || !this.localUserRef._parsed.equipment[3]) return false;
            return this.localUserRef._parsed.equipment[3]._parsed.equipmentMeta.toolType === adventure.toolType;
        },
        isAdventureAvailable(adventure) {
            if (!this.localUserRef) return false;
            const supported = this.isSupported(adventure);
            const isTime = this.getCooldown(adventure.cooldownId) <= 0;
            const hasEquipment = this.hasEquipment(adventure);
            return !this.isLoading && supported && isTime && hasEquipment;
        },
      startAdventure(adventure) {
        if (!this.isAdventureAvailable(adventure)) return;
        this.isLoading = true;
        callEndpoint(adventure.endpoint, 'POST', {})
            .then((data) => {
                setUser(data.user);
                this.data = data;
                this.isLoading = false;
                this.adventure = adventure.title;
            })
            .catch((error) => {
                console.warn("Error while doing adventure " + adventure + "  " + error.response.data);
                this.isLoading = false;
            });
      },
      reset() {
        this.data = null;
        this.adventure = null;
      }
    },
  };
  </script>
  
  <style scoped>
  .adventure-view {
    margin-top: 20px;
  }
  
  .adventure-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin: 30px;
  }
  
  .adventure-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 10px;
    padding: 10px;
    border: none;
    background-color: #f0f0f0;
    border-radius: 5px;
    border: 2px solid #ccc;
    transition: background-color 0.3s ease;
    font-size: 16px;
    width: 20%;
  }
  
  .adventure-button:hover {
    background-color: #e0e0e0;
  }
  
  .adventure-image {
    width: 100px; /* Adjust image size as needed */
    height: 100px; /* Adjust image size as needed */
    border-radius: 50%;
    margin-bottom: 10px;
  }
  
  .adventure-info {
    text-align: center;
  }
  
  .red {
    color: red;
  }
  </style>
  