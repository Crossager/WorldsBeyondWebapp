<template>
  <div class="craft-view">
    <h2>Crafting Recipes</h2>
    <div class="search-and-amount">
      <div class="search-bar">
        <input v-model="searchQuery" type="text" placeholder="Search by name" />
      </div>
      <div class="amount-selector">
        <label for="amount">Craft Amount:</label>
        <input v-model.number="amount" type="number" min="1" />
      </div>
    </div>
    <template
      v-for="({ isUnlocked, recipe }, index) in filteredCraftingRecipes"
      :key="index"
    >
      <div class="recipe-container" v-if="isUnlocked">
        <h3>{{ recipe.name }}</h3>
        <div class="item-section">
          <div class="required-items">
            <h4>Required Items</h4>
            <div class="item-grid">
              <div
                v-for="(requiredItem, index) in recipe._parsed.requiredItems"
                :key="index"
              >
                <ItemDisplay
                  :item="requiredItem[0]"
                  :amount="requiredItem[1] * amount"
                  :showTooltip="false"
                  :additionalDetail="
                    getInventoryAmountText(
                      requiredItem[0],
                      requiredItem[1] * amount
                    )
                  "
                />
              </div>
            </div>
          </div>
          <div class="output-items">
            <h4>Output Items</h4>
            <div class="item-grid">
              <div
                v-for="(outputItem, index) in recipe._parsed.outputItems"
                :key="index"
              >
                <ItemDisplay
                  :item="outputItem[0]"
                  :amount="outputItem[1] * amount"
                  :additionalDetail="getInventoryAmountText(outputItem[0], 0)"
                />
              </div>
            </div>
          </div>
        </div>
        <button
          :class="{
            'simple-button': canCraftRecipe[index],
            'simple-button-disabled': !canCraftRecipe[index],
          }"
          @click="() => craftItem(recipe)"
          :disabled="!canCraftRecipe[index]"
        >
          Craft
        </button>
      </div>
      <div v-else class="recipe-container-locked">
        <h3>???</h3>
        <p>You lack the following skill levels:</p>
        <div
          v-for="(skillLevel, index) in recipe._parsed.requirement.filter(
            (x) => x.level > 0
          )"
          :key="index"
        >
          <p>
            {{ skillLevel.skill.name }}
            {{ localToRomanNumerals(skillLevel.level) }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { callEndpoint, getUserRef, setUser } from "@/main";
import { craftingRecipes } from "@/resources";
import { toRomanNumerals } from "@/utils";
import ItemDisplay from "./ItemDisplay.vue";

export default {
  data() {
    return {
      localUserRef: getUserRef(),
      searchQuery: "",
      isLoading: false,
      amount: 1,
    };
  },
  components: {
    ItemDisplay,
  },
  computed: {
    filteredCraftingRecipes() {
      const query = this.searchQuery.toLowerCase().trim();
      return craftingRecipes
        .filter((recipe) => recipe.name.toLowerCase().includes(query))
        .map((recipe) => {
          return {
            isUnlocked: recipe._parsed.hasLevelRequirement(this.localUserRef),
            hasItems: this.hasItems(recipe),
            recipe,
          };
        })
        .filter((recipe) => query === '' || recipe.isUnlocked)
        .sort((a, b) => {
          return a.hasItems ? -1 : b.hasItems ? 1 : 0;
        })
        .sort((a, b) => {
          return a.isUnlocked ? -1 : b.isUnlocked ? 1 : 0;
        });
    },
    canCraftRecipe() {
      const result = [];
      this.filteredCraftingRecipes.forEach(
        ({ isUnlocked, hasItems }, index) => {
          result[index] = isUnlocked && hasItems && !this.isLoading;
        }
      );
      return result;
    },
  },
  methods: {
    canCraft(recipe) {
      return !this.isLoading && this.hasItems(recipe);
    },
    hasItems(recipe) {
      return this.localUserRef._parsed.containsItems(
        recipe._parsed.requiredItems,
        this.amount
      );
    },
    craftItem(recipe) {
      if (!this.canCraft(recipe)) return;
      this.isLoading = true;
      const data = { id: recipe.id, amount: this.amount };
      callEndpoint("craft", "POST", data)
        .then((user) => {
          setUser(user);
          this.isLoading = false;
        })
        .catch((error) => {
          console.warn("Error when crafting: " + error.response.data);
          this.isLoading = false;
        });
    },
    localToRomanNumerals(number) {
      return toRomanNumerals(number);
    },
    getInventoryAmountText(item, requiredAmount) {
      const inventoryAmount = this.localUserRef._parsed.getItemAmount(item);
      return `<p style="${
        inventoryAmount < requiredAmount ? "color: red;" : ""
      }">In Inventory: ${inventoryAmount}</p>`;
    },
  },
};
</script>

<style scoped>
/* ... Existing styles ... */

.search-and-amount {
  margin-bottom: 10px;
}

.amount-selector {
  text-align: center;
  margin-bottom: 20px;
}

.amount-selector label {
  margin-right: 5px;
}
.search-bar {
  margin-bottom: 10px;
  width: 40%;
  margin: 0 auto; /* Center the search bar */
  margin-bottom: 10px;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  text-align: center;
  font: 1em sans-serif;
}

.amount-selector input {
  width: 50px;
  padding: 5px;
  text-align: center;
}
.simple-button {
  padding: 10px;
  padding-left: 40px;
  padding-right: 40px;
  margin-left: 10px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  background-color: #3498db;
  color: #fff;
  transition: background-color 0.3s ease;
}
.simple-button-disabled {
  padding: 10px;
  padding-left: 40px;
  padding-right: 40px;
  margin-left: 10px;
  font-size: 16px;
  cursor: not-allowed;
  border: none;
  border-radius: 5px;
  background-color: #616161;
  color: #fff;
  transition: background-color 0.2s ease;
}
.craft-view {
  text-align: center;
  margin-left: 10%;
  margin-right: 10%;
}

.recipe-container {
  border: 1px solid #ddd;
  margin-bottom: 20px;
  padding: 20px;
  padding-left: 40px;
  padding-right: 40px;
  box-sizing: border-box;
}

.recipe-container-locked {
  border: 1px solid #ccdc;
  background-color: #ddd;
  margin-bottom: 20px;
  padding: 20px;
  padding-left: 40px;
  padding-right: 40px;
  box-sizing: border-box;
}

.item-section {
  display: flex;
  justify-content: space-between;
}

.required-items,
.output-items {
  flex-basis: 45%;
}

.required-items h4,
.output-items h4 {
  margin-bottom: 5px;
}

.item-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.item-grid > div {
  flex-basis: calc(50% - 10px); /* 50% width with 10px gap */
}
</style>
