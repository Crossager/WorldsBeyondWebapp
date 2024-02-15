import { createApp, ref } from 'vue'
import App from './App.vue'
import { parseItem, getSkillById, parseTotalExp, parseAttributes, items, getWorldyId, apiUrl } from './resources';

const app = createApp(App)

app.mount('#app')

var token;
var user;
var userRef;
var isRequesting = false;

function callEndpoint(endpoint, method, payload) {
  // Concatenate the url and the endpoint
  var fullUrl = apiUrl + endpoint;

  // Create headers object
  var headers = {
    "Content-Type": "application/json",
  };

  // Add token to headers if it exists
  if (token) {
    headers["token"] = token;
  }

  // Configure the fetch options
  var options = {
    method: method,
    headers: headers,
  };

  // Add payload to options if provided
  if (payload) {
    options.body = JSON.stringify(payload);
  }

  isRequesting = true;
  // Make the fetch request
  return fetch(fullUrl, options)
    .then(async (response) => {
      // Check if the response status is in the range of 200-299 (success)
      
      isRequesting = false;
      if (response.status === 429) {
        console.warn("Too many requests, sleeping 150ms");
        await sleep(150);
        return await callEndpoint(endpoint, method, payload);
      }
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the response JSON
      return response.json();
    });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function setToken(newToken) { 
  token = newToken;
}

function getToken() {
  return token;
}

function getEntity(user, key) {
  return user.entityMap.filter((entity) => entity[0] === key)[0][1];
}

// adds some more 'friendly' parsed values to the user
function getParsedUserData(user) {
  const parsedData = {};

  parsedData.money = getEntity(user, 1);
  parsedData.joinDate = new Date(getEntity(user, 2));
  parsedData.inventory = user.inventory.map((pair) => [parseItem(pair[0]), pair[1]]);
  parsedData.equipment = user.equipment.map((item) => item ? parseItem(item) : null);
  parsedData.skills = user.entityMap.map((entity) => {return { ...parseTotalExp(entity[1]), skill: getSkillById(entity[0]) }}).filter((x) => x.skill);
  parsedData.attributes = parseAttributes(user.attributes);
  parsedData.world = getWorldyId(user.world);
  parsedData.getItemAmount = function (item) {
    const found = parsedData.inventory.find((inventoryItem) => {
      return inventoryItem[0]._parsed.hashCode === item._parsed.hashCode;
    });
    return found ? found[1] : 0;
  };
  parsedData.containsItems = function (itemSet, multiplier) {
    for (const pair of itemSet) {
      const inventoryAmount = this.getItemAmount(pair[0]);
      if (!inventoryAmount || inventoryAmount < pair[1] * multiplier) {
        return false;
      }
    }
  
    return true;
  };

  return parsedData;
}

function setUser(newUser) {
  const parsedUser = { ...newUser };
  parsedUser._parsed = getParsedUserData(newUser);
  user = parsedUser;
  if (!userRef) {
    userRef = ref(parsedUser);
    console.log("Set initial user value");
    console.log(parsedUser);
  } else {
    userRef.value = parsedUser;
    console.log("Updated user value");
    console.log(parsedUser);
  }
}

function getUserRef() {
  if (!userRef) {
    userRef = ref(user);
  }
  return userRef;
}

async function fetchUser() {
  return callEndpoint('user', 'GET', null)
    .then(function (data) {
        setUser(data);
    });
}

// Cookie functions provided by https://www.w3schools.com/js/js_cookies.asp
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";SameSite=Strict;path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function isLoading() {
  return userRef === undefined || userRef.value === undefined || isRequesting;
}

export {
  callEndpoint,
  setToken,
  getToken,
  setCookie,
  getCookie,
  setUser,
  getEntity,
  user,
  getUserRef,
  fetchUser,
  isLoading,
}