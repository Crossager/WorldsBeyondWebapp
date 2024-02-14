<template>
    <div class="salvage-controls">
            <input v-model="salvageAmount" type="number" placeholder="Amount to Salvage" class="salvage-control" min="1" :max="`${amount}`" />
            <button class="salvage-button-max" @click="salvageAmount = amount">MAX</button>
            <button :class="isDisabled ? 'simple-button-disabled' : 'simple-button'" :disabled="salvageAmount > amount" @click="salvageItem">Salvage</button>
            <h3>{{ salvagePrice === -1 ? 'This item cannot be salvaged' : `Salvage Profit: ${salvageAmount * salvagePrice}` }}</h3>
    </div>
    <div class="item-info">
        <ItemDisplay class="item-display" :item="selectedItem" :amount="amount" />
        <button class="simple-button" @click="equipItem()" :disabled="!isEquippable">Equip</button>
    </div>
</template>

<script>
import { callEndpoint, setUser, getUserRef } from '@/main';
import ItemDisplay from './ItemDisplay.vue';

export default {
    props: {
        selectedItem: Object,
        amount: Number,
    },
    data() {
        return {
            salvageAmount: 1,
            isLoading: false,
            localUserRef: getUserRef(),
        }
    },
    watch: {
        selectedItem(newVal, oldVal) {
            if (newVal.itemType != oldVal.itemType) this.salvageAmount = 1;
        }
    },
    computed: {
        salvagePrice() {
            return this.selectedItem._parsed.itemType.properties[0];
        },
        isDisabled() {
            return this.amount < this.salvageAmount || this.salvagePrice === -1 || this.isLoading;
        },
        isEquippable() {
            return this.selectedItem._parsed.equipmentMeta && !this.isLoading;
        },
    },
    methods: {
        salvageItem() {
            if (this.isDisabled) return;
            this.isLoading = true;
            const transferableItem = { ...this.selectedItem };
            transferableItem._parsed = undefined;
            callEndpoint('salvage', 'POST', [[transferableItem, this.salvageAmount]])
                .then((user) => {
                    setUser(user);
                    this.isLoading = false;
                })
                .catch((error) => {
                    console.warn("Error when salvaging: " + error);
                    this.isLoading = false;
                });
        },
        equipItem() {
            if (this.isEquippable) {
                this.isLoading = true;
                const newEquipment = [ ...this.localUserRef.equipment ];
                const transferableItem = { ...this.selectedItem };
                transferableItem._parsed = undefined;
                newEquipment[this.selectedItem._parsed.equipmentMeta.equipmentSlot] = transferableItem;
                callEndpoint('equipment', 'POST', newEquipment)
                    .then((user) => {
                        setUser(user);
                        this.isLoading = false;
                    })
                    .catch((error) => {
                        console.warn('Error when equipping item:', error);
                        this.isLoading = false;
                    });
            }
        },
        
    },
    components: { ItemDisplay }
};
</script>

<style scoped>
.item-section {
  align-items: center;
  margin-bottom: 50px;
}
.salvage-controls {
  align-items: center;
  transition: border 0.3s ease;
}
.salvage-controls button {
    margin-left: 10px;
}
.item-info button {
    margin-top: 4px;
    width: 100%;
}
.salvage-button-max {
  padding: 10px;
  margin-left: 10px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  background-color: #dbd034;
  color: #fff;
  transition: background-color 0.3s ease;
}

.simple-button:hover {
  background-color: #2980b9;
}

.salvage-controls input {
  padding: 8px;
  font-size: 16px;
  text-align: center;
}
</style>
