import { ref } from "vue";
import { numberArrayHashcode, stringHashcode } from "./utils";

const caughtError = ref(null);
const apiUrl = 'https://worldsbeyondapi.crossager.net/'

async function fetchResource(endpoint) {
  var fullUrl = apiUrl + "resources/" + endpoint;

  var options = {
    method: 'GET',
  };
  try {
    return (await fetch(fullUrl, options)).json();
  } catch (error) {
    caughtError.value = error;
  }
}

const templateItem = {
  attributes: [0, 0, 0, 0],
  itemDisplay: {
    name: "",
    category: ""
  },
  enchantmentSet: [],
  itemType: "blank",
  _parsed: {
    itemType: {
      id: "",
      display: {
        name: "None",
        category: ""
      },
      properties: [
        -1,
        null
      ]
    }
  }
}

let isLoaded = false;

const rhello = fetchResource('hello');
const rattributes = fetchResource('attributes');
const rexpToLevelUp = fetchResource('exp-level-up');
const rskills = fetchResource('skills');
const rfullSetBonuses = fetchResource('full-set-bonus');
const ritems = fetchResource('items');
const ritemCategories = fetchResource('item-categories');
const rcraftingRecipes = fetchResource('crafting-recipes');
const rworlds = fetchResource('worlds');
const rcreatures = fetchResource('creatures');
const renchantments = fetchResource('enchantments');

const hello = await rhello;
const attributes = await rattributes;
const expToLevelUp = await rexpToLevelUp;
const skills = await rskills;
const fullSetBonuses = await rfullSetBonuses;
const items = await ritems;
const itemCategories = await ritemCategories;
const craftingRecipes = await rcraftingRecipes;
const worlds = await rworlds;
const creatures = await rcreatures;
const enchantments = await renchantments;

console.log('Done with resources');

const toolTypes = ['Mining Tool', 'Fishing Tool', 'Weapon'];
const equipmentSlots = ['Helmet', 'Chest', 'Legs', 'Hand', 'Offhand'];
const enchantmentTypes = ['Basic', 'Rare'];
const internalEquipmentSlots = ['HEAD', 'CHEST', 'LEGS', 'HAND', 'OFFHAND'];

function getItemById(id) {
  return items.filter((item) => item.id === id)[0];
}
function getWorldyId(id) {
  return worlds.filter((world) => world.id === id)[0];
}
function getEnchantmentById(id) {
  return enchantments.filter((enchantment) => enchantment.id === id)[0];
}
function getFullSetBonusById(id) {
  return fullSetBonuses.filter((fullSetBonus) => fullSetBonus.id === id)[0];
}
function getSkillById(id) {
  return skills.filter((skill) => skill.id === id)[0];
}
function getCreatureById(id) {
  return creatures.filter((creature) => creature.id === id)[0];
}
function parseTotalExp(totalExp) {
  let level = 0;
  let remainingExp = totalExp;
  while ((level === expToLevelUp.length ? Infinity : expToLevelUp[level]) <= remainingExp && level !== expToLevelUp.length) {
    remainingExp -= expToLevelUp[level];
    level++;
  }
  return {
    exp: remainingExp,
    level,
    totalExp,
    expToLevelUp: expToLevelUp[level],
  }
}
function createItemHashCode(item) {
  const typeHashcode = stringHashcode(item.itemType);
  const attributeHashcode = numberArrayHashcode(item.attributes);
  const displayHashcode = stringHashcode(item.itemDisplay.name);
  const enchantmentHashcode = numberArrayHashcode(item.enchantmentSet.map((entry) => {
    return numberArrayHashcode([ entry.type, entry.level, stringHashcode(entry.enchantment) ]);
  }));
  return numberArrayHashcode([ typeHashcode, attributeHashcode, displayHashcode, enchantmentHashcode ]);
}
function parseItem(item, force = false) {
  if (item._parsed && !force) {
    console.warn('Tried to parse already parsed item');
    console.warn(item);
    return item;
  }
  let parsedItem;
  if (typeof item === 'object') {
    parsedItem = { ...item }
  } else {
    parsedItem = { ...templateItem };
    parsedItem.itemType = item;
  }
  const parsedData = {};
  parsedData.itemType = getItemById(parsedItem.itemType);

  if (typeof item !== 'object') {
    parsedItem.itemDisplay = parsedData.itemType.display;
  }

  parsedData.equipmentMeta = parsedData.itemType.properties[1] ? { ...parsedData.itemType.properties[1] } : null;
  const equipmentMeta = parsedData.equipmentMeta;
  if (equipmentMeta) {
    equipmentMeta.attributeBonus = parseAttributes(equipmentMeta.attributeBonus);
    equipmentMeta.fullSetBonus = getFullSetBonusById(equipmentMeta.fullSetBonus);
  }
  parsedData.enchantmentSet = parsedItem.enchantmentSet
    .map((enchantment) => {return { type: enchantmentTypes[enchantment.type], 'enchantment': getEnchantmentById(enchantment.enchantment), 'level': enchantment.level }})
    
  parsedItem._parsed = parsedData;
  parsedItem._parsed.hashCode = createItemHashCode(parsedItem);
  return parsedItem;
}
function parseAttributes(attrbutes) {
  return attrbutes.map((val, index) => {return { 'name': attributes[index], 'value': val }});
}

try {
  enchantments.forEach((enchantment) => {
    enchantment._parsed = {
      itemCost: enchantment.itemCost.map((cost) => [ parseItem(cost[0]), cost[1] ])
    }
    return enchantment;
  });
  worlds.forEach((world) => {
    world._parsed = {
      unlockCost: world.unlockCost.map((cost) => [ parseItem(cost[0]), cost[1] ]),
      merchantItems: world.merchantItems.map((item) => {return { ...item, item: parseItem(item.item) }}),
      fishingTreasureItems: world.fishingTreasureItems.map((item) => parseItem(item)),
      fishingGarbageItems: world.fishingGarbageItems.map((item) => parseItem(item)),
      miningLootItems: world.miningLootItems.map((item) => parseItem(item)),
      creatures: world.creatures.map((creature) => getCreatureById(creature)),
      supportsMining: world.miningLootItems.length > 0,
      supportsFishing: world.fishingTreasureItems.length > 0 || world.fishingGarbageItems.length > 0,
      supportsHunting: world.creatures.length > 0,
    }
    return world;
  });
  fullSetBonuses.forEach((fullSetBonus) => {
    fullSetBonus._parsed = {
      attributeBonus: fullSetBonus.attributeBonus.map((val, index) => {return { 'name': attributes[index], 'value': val }}),
      pieceCount: fullSetBonus.fullSet.filter((item) => !!item).length,
      fullSet: fullSetBonus.fullSet.map((equipment, index) => {
        return { slot: equipmentSlots[index], equipment: equipment ? parseItem(equipment) : undefined };
      }),
      wearingCount(equipmentSet) {
        let amount = 0;
        equipmentSet.forEach((equipment, index) => {
          const setItem = fullSetBonus.fullSet[index];
          if (equipment.equipment && equipment.equipment.itemType === setItem) {
            amount++;
          }
        });
        return amount;
      }
    }
    return fullSetBonus;
  });
  creatures.forEach((creature) => {
    creature._parsed = {
      loot: creature.loot.map((item) => parseItem(item)),
    }
    return creature;
  });
  craftingRecipes.forEach((craftingRecipe) => {
    craftingRecipe._parsed = {
      requiredItems: craftingRecipe.requiredItems.map((pair) => [ parseItem(pair[0]), pair[1] ]),
      outputItems: craftingRecipe.outputItems.map((pair) => [ parseItem(pair[0]), pair[1] ]),
      requirement: craftingRecipe.requirement.map((level, index) => {return { skill: skills[index], level, index }}).filter((x) => x.level > 0),
      hasLevelRequirement(user) {
        for (let i = 0; i < craftingRecipe.requirement.length; i++) {
          const requiredLevel = craftingRecipe.requirement[i];
          const userSkill = user._parsed.skills[i];
      
          if (userSkill.level < requiredLevel) {
            // If the required skill level is not met, return false
            return false;
          }
        }
      
        // All skill requirements are met
        return true;
      }
    }
  })
  
  isLoaded = true;
} catch (error) {
  caughtError.value = error;
  console.log(error);
}

export {
    isLoaded,
    apiUrl,
    caughtError,
    hello,
    attributes,
    items,
    enchantments,
    fullSetBonuses,
    creatures,
    craftingRecipes,
    worlds,
    getItemById,
    parseItem,
    getEnchantmentById,
    getSkillById,
    parseTotalExp,
    parseAttributes,
    getWorldyId,
    getCreatureById,
    templateItem,
    toolTypes,
    equipmentSlots,
    enchantmentTypes,
    internalEquipmentSlots,
}