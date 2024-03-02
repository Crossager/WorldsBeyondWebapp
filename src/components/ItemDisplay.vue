<template>
  <div class="top">
    <div @click="handleItemClick"
       :class="disabled ? 'item-box item-disabled' : 'item-box'"
       :style="itemClick ? 'cursor:pointer' : ''"
       >
       
       <img v-if="item && item.enchantmentSet.length > 0" :src="'assets/enchanted_star.png'" alt="" class="enchanted-star" />
       <img :src="`assets/${item.itemType}.png`" alt="" class="item-image" />
  
      <div class="item-details">
        <h3 v-if="item.itemDisplay.name">{{ item.itemDisplay.name }}</h3>
        <p v-if="!!amount">Amount: {{ amount }}</p>
        <div v-if="additionalDetail" v-html="additionalDetail"></div>
      </div>
    </div>
    <div v-if="showTooltip && item" class="tooltip">
        <div class="tooltip-category">
          <p>Category</p>
          <img :src="`assets/${item.itemDisplay.category}.png`" alt="" />
        </div>
        <div v-if="equipmentMeta">
          <p v-if="equipmentMeta.equipmentSlot === 3">{{ localToolTypes[equipmentMeta.toolType] }}</p>
          <p v-if="equipmentMeta.equipmentSlot < 3">{{ localEquipmentSlots[equipmentMeta.equipmentSlot] }}</p>
          <p v-if="equipmentMeta.damage && equipmentMeta.damage !== 0">Damage: {{ equipmentMeta.damage }}</p>
          <template v-for="(attribute, index) in equipmentMeta.attributeBonus" :key="index">
            <p v-if="attribute.value > 0" >
              +{{ attribute.value }} {{ attribute.name }}
            </p>
          </template>
          <p v-if="test()"></p>
          <template v-if="equipmentMeta.fullSetBonus.id !== 0">
            <br />
            <div class="full-set-bonus">
              <p>Full set bonus: <strong>{{ equipmentMeta.fullSetBonus.name }}</strong></p>
              <div>
                <template v-for="(attribute, index) in equipmentMeta.fullSetBonus._parsed.attributeBonus" :key="index">
                  <p v-if="attribute.value > 0" >
                    +{{ attribute.value }} {{ attribute.name }}
                  </p>
                </template>
              </div>
            </div>
          </template>
          
          <div v-if="item.enchantmentSet.length > 0">
            <br />
            <img :src="'assets/enchanted_star.png'" alt="" class="enchanted-star-small" />
            <div v-for="(enchantment, index) in item._parsed.enchantmentSet" :key="index">
                <p><strong>{{ enchantment.type }} enchantment</strong></p>
                <p>{{ enchantment.enchantment.name }} <strong>{{ localToRomanNumerals(enchantment.level) }}</strong></p>
                <br />
            </div>
          </div>
        </div>
        
        <div v-if="additionalTooltip" class="additional-tooltip" v-html="additionalTooltip"></div>
      </div>
  </div>
    
  </template>

<script>
import { templateItem, equipmentSlots, toolTypes } from '../resources.js'
import { toRomanNumerals } from '@/utils';
export default {
  data() {
    return {
      localEquipmentSlots: equipmentSlots,
      localToolTypes: toolTypes,
    }
  },
  props: {
    item: {
        type: Object,
        default: templateItem
    },
    amount: Number,
    showTooltip: {
        type: Boolean,
        default: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    itemClick: Function, // New prop for item click action
    additionalTooltip: String, // New prop for additional tooltip content
    additionalDetail: String,
  },
  computed: {
    equipmentMeta() {
      return this.item._parsed.equipmentMeta;
    },
  },
  methods: {
    handleItemClick() {
      if (this.itemClick) {
        this.itemClick();
      }
    },
    localToRomanNumerals(number) {
      return toRomanNumerals(number);
    },
    test() {
      if (!this.equipmentMeta.fullSetBonus) {
        console.log(this.item)
      }
    }
  },
};
</script>

<style scoped>
.full-set-bonus {
  border: 1px solid rgb(190, 190, 190);
}
.enchanted-star {
  width: 20px;
  height: 20px;
}
.enchanted-star-small {
  width: 12px;
  height: 12px;
}
.tooltip-category {
  text-align: center; /* Center the icon */
  margin-bottom: 10px; /* Add some space between the icon and other content */
  border: 1px solid black;
}

.tooltip-category img {
  width: 35px; /* Adjust the width as needed */
  height: 35px; /* Adjust the height as needed */
}
.item-box {
  border: 2px solid rgb(207, 207, 207);
  padding: 10px;
  background-color: #f9f9f9;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.item-box:hover {
  border: 2px solid #3498db; /* Highlight border on hover */
  transform: scale(1.05);
  z-index: 2;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-bottom: 10px;
  border: 1px solid rgb(187, 187, 187);
}

.item-details {
  background-color: #eee;
  padding: 10px;
  border-radius: 0 0 5px 5px;
}

.top {
  position: relative;
}

.tooltip {
  margin-top: -40px;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 10px;
  width: 150%;
  display: none;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.tooltip p {
  margin: 0;
}

.item-box:hover + .tooltip {
  display: block;
  z-index: 2;
}
.additional-tooltip {
  margin-top: 10px; /* Adjust text color as needed */
}
.item-disabled {
  filter: grayscale(100%) brightness(0.8);
  cursor: not-allowed; /* Change cursor to not-allowed */
}
</style>