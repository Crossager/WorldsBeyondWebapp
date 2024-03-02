<template>
  <div>
    <div class="equipment-info">
      <h2>Equipment</h2>
      <template v-for="i in 3" :key="i">
        <button class="simple-button" :disabled="localUserRef.selectedEquipment === i - 1" @click="selectEquipment(i - 1)">Loadout {{ i }}</button>
      </template>
      <div>
        <h4>Full Set Bonus:</h4>
        <h3 v-if="activeFullSetBonus">
          {{ activeFullSetBonus.name }}:
          {{ activeFullSetBonus._parsed.wearingCount(equipment) }} /
          {{ activeFullSetBonus._parsed.pieceCount }}
        </h3>
      </div>
    </div>
    <table class="equipment-table">
      <tbody>
        <tr>
          <td
            v-for="(item, index) in equipment"
            :key="index"
            class="equipment-slot-name"
            :style="`width: ${1 / equipment.length}%;`"
          >
            {{ item.slot }}
          </td>
        </tr>
        <tr>
          <td v-for="(item, index) in equipment" :key="index">
            <ItemDisplay
              :item="item.equipment"
              :showTooltip="!!item.equipment"
              :itemClick="() => unequipItem(index)"
              :disabled="isLoading"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <h3>Items</h3>

    <div class="options-bar">
      <div class="pagination">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="page-button"
        >
          Previous
        </button>
        <span>Page {{ currentPage }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="page-button"
        >
          Next
        </button>
      </div>
      <div class="salvage-controls">
        <input
          v-model="salvageAmount"
          type="number"
          placeholder="Amount to Salvage"
          class="salvage-control"
          min="1"
          :max="`${selectedItem ? selectedItem[1] : undefined}`"
        />
        <button class="salvage-button-max" @click="salvageAmount = selectedItem ? selectedItem[1] : 1">
          MAX
        </button>
        <button
          class="simple-button"
          :disabled="isSalvageDisabled"
          @click="salvageItem"
        >
          Salvage
        </button>
        <h3 v-if="selectedItem">
          {{
            salvagePrice === -1
              ? "This item cannot be salvaged"
              : `Salvage Profit: ${salvageAmount * salvagePrice}$`
          }}
        </h3>
      </div>
      <div class="item-info">
        <ItemDisplay
          class="item-display"
          :item="selectedItem ? selectedItem[0] : undefined"
          :amount="selectedItem ? selectedItem[1] : undefined"
        />
        <button
          class="simple-button"
          @click="equipItem()"
          :disabled="!isEquippable"
        >
          Equip
        </button>
      </div>
      <!-- <ItemView v-if="selectedItem" :selectedItem="selectedItem[0]" :amount="selectedItem[1]" /> -->
    </div>

    <table class="inventory-table">
      <tbody>
        <tr v-for="(row, rowIndex) in paginatedRows" :key="rowIndex">
          <td
            v-for="(pair, colIndex) in row"
            :key="colIndex"
            class="inventory-item"
            :style="
              (absoluteIndexOf(rowIndex, colIndex) === selectedItemIndex
                ? 'background-color: #3498db;'
                : '') + `width: ${100 / columns}%;`
            "
          >
            <!-- Use ItemDisplay component -->
            <ItemDisplay
              :item="pair[0]"
              :amount="pair[1]"
              :showTooltip="!!pair[1]"
              :itemClick="() => selectItem(rowIndex, colIndex)"
            />
          </td>
          <td v-if="row.length < columns">
            <div :style="`width: ${100 / columns * (columns - row.length)}%;`"><br /></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { getUserRef, callEndpoint, setUser } from "../main";
import { templateItem, equipmentSlots } from "../resources";
import ItemDisplay from "./ItemDisplay.vue";
import ItemView from "./ItemView.vue";
export default {
  name: "InventoryView",
  components: {
    ItemDisplay,
    ItemView,
  },
  data() {
    return {
      columns: 8,
      rows: 3,
      isLoading: false,
      currentPage: 1,
      localUserRef: getUserRef(),
      selectedItemIndex: -1,
      fillEmptyCells: false,
      salvageAmount: 1,
    };
  },
  watch: {
    selectedItem(newVal, oldVal) {
      
        if (!newVal || !oldVal || newVal.itemType != oldVal.itemType) this.salvageAmount = 1;
    }
  },
  computed: {
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
    itemsPerPage() {
      return this.rows * this.columns;
    },
    items() {
      return !this.localUserRef ? [] : this.localUserRef._parsed.inventory;
    },
    paginatedRows() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      let sliced = this.items.slice(startIndex, endIndex);
      if (sliced.length < this.itemsPerPage && this.fillEmptyCells)
        sliced = sliced.concat(
          Array(this.itemsPerPage - sliced.length).fill([templateItem])
        );
      return this.chunkArray(sliced, this.columns);
    },
    totalPages() {
      return Math.ceil(this.items.length / this.itemsPerPage);
    },
    selectedItem() {
      return this.items[this.selectedItemIndex];
    },
    activeFullSetBonus() {
      return this.equipment[0] && this.equipment[0].equipment
        ? this.equipment[0].equipment._parsed.equipmentMeta.fullSetBonus
        : undefined;
    }, 
        isEquippable() {
          if (!this.selectedItem) return false;
            return this.selectedItem[0]._parsed.equipmentMeta && !this.isLoading;
        },
        salvagePrice() {
          if (!this.selectedItem) return false;
            return this.selectedItem[0]._parsed.itemType.properties[0];
        },
    isSalvageDisabled() {
      if (!this.selectedItem) return false;
        return this.selectedItem[1] < this.salvageAmount || this.salvagePrice === -1 || this.isLoading;
    },
  },
  methods: {
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    selectItem(rowIndex, colIndex) {
      const index = this.absoluteIndexOf(rowIndex, colIndex);
      if (!this.items[index][0].itemDisplay.name) return;
      if (this.selectedItemIndex === index) {
        this.selectedItemIndex = -1;
      } else {
        this.selectedItemIndex = index;
      }
    },
    indexOf(rowIndex, colIndex) {
      return rowIndex * this.columns + colIndex;
    },
    absoluteIndexOf(rowIndex, colIndex) {
      return (
        this.indexOf(rowIndex, colIndex) +
        this.itemsPerPage * (this.currentPage - 1)
      );
    },
    chunkArray(array, size) {
      const chunkedArray = [];
      for (let i = 0; i < array.length; i += size) {
        chunkedArray.push(array.slice(i, i + size));
      }
      return chunkedArray;
    },
    unequipItem(index) {
      this.isLoading = true;
      const newEquipment = [...this.localUserRef.wardrobe[this.localUserRef.selectedEquipment]];
      newEquipment[index] = null;
      callEndpoint("equipment", "POST", newEquipment)
        .then((user) => {
          setUser(user);
          this.isLoading = false;
          this.$emit("update");
        })
        .catch((error) => {
          console.warn("Error when unequipping item: " + error);
          this.isLoading = false;
        });
    },
    salvageItem() {
      if (this.isSalvageDisabled) return;
      this.isLoading = true;
      const transferableItem = { ...this.selectedItem[0] };
      transferableItem._parsed = undefined;
      callEndpoint("salvage", "POST", [[transferableItem, this.salvageAmount]])
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
        const newEquipment = [...this.localUserRef.wardrobe[this.localUserRef.selectedEquipment]];
        const transferableItem = { ...this.selectedItem[0] };
        transferableItem._parsed = undefined;
        newEquipment[this.selectedItem[0]._parsed.equipmentMeta.equipmentSlot] =
          transferableItem;
        callEndpoint("equipment", "POST", newEquipment)
          .then((user) => {
            setUser(user);
            this.isLoading = false;
          })
          .catch((error) => {
            console.warn("Error when equipping item: " + error);
            this.isLoading = false;
          });
      }
    },
    selectEquipment(index) {
      if (this.localUserRef.selectEquipment === index) return;

      this.isLoading = true;
      callEndpoint("select-equipment", "POST", {index})
        .then((user) => {
          setUser(user);
          this.isLoading = false;
        })
        .catch((error) => {
          console.warn("Error when selecting equipment: " + error);
          this.isLoading = false;
        });
    },
  },
};
</script>

<style scoped>
h3 {
  margin-top: 20px;
  margin-bottom: 40px;
}

.equipment-table {
  border-collapse: collapse;
  table-layout: fixed;
}

.equipment-table td {
  padding: 10px;
  border: none; /* Remove border lines */
}

.equipment-slot-name {
  font-weight: bold;
}

.equipment-info {
  display: flex;
  justify-content: space-around;
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

.salvage-controls button {
    margin-left: 10px;
}
.item-info {
  width: 300px;
  height: 270px;
}
.item-info button {
    margin-top: 4px;
    width: 100%;
}
.salvage-controls input {
  padding: 8px;
  font-size: 16px;
  text-align: center;
}
.inventory-table {
  width: 95%;
  margin: auto;
  margin-top: 30px;
  border-collapse: collapse;
}

.inventory-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.options-bar {
  display: flex;
  justify-content: space-around;
}

.page-button {
  padding: 10px;
  margin-left: 10px;
  margin-right: 10px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  background-color: #3498db;
  color: #fff;
  transition: background-color 0.3s ease;
}

.page-button:hover {
  background-color: #2980b9;
}

.page-button:disabled {
  background-color: #bdc3c7;
  border: 1px solid #bdc3c7;
  cursor: not-allowed;
}

.pagination {
  align-items: center;
}

/* Additional styling as needed */
</style>
