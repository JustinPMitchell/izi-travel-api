'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');
var async = require('async');

var cityUuid = "";
var museumUuid = [];
var imageUuid = [];
var audioUuid = [];
var contentProviderUuid = [];

var iziObject = {
  iziOriginal: [],
  iziTitle: [],
  iziType: [],
  iziLatitude: [],
  iziLongitude: [],
  
  iziPhoneNumber: [],
  iziWebsite: [],
  iziCountry: [],
  iziCity: [],
  iziAddress: [],
  iziSchedule: [],
  
  iziDescription: [],
  imageFile: [],
  
  audioFile: []
}



var izi = function() {
  
}

/* 
  cityData takes in city Name and api key
  defines cityUuid
*/
izi.prototype.cityData = function (city, key/*, callback*/) { // added for waterfall
  var url = 'https://cors-anywhere.herokuapp.com/https://api.izi.travel/mtg/objects/search?languages=en,ru&includes=translations&type=city&query=' + city;
  console.log(url);
  return fetch(url, {
    headers: {
      "X-IZI-API-KEY": key
    }
  })
  .then(response => response.json())
  .then(data => {
    cityUuid = data[0].uuid;
    console.log("this is cityUuid: ", cityUuid);
    // callback(null, cityUuid, key); // added for waterfall
  })
  .catch(error => console.error(error))
}

/* 
  museumsData takes in a cityUuid and api key
  defines up to 10 museumUuid's or the amount of uuid's given the city
*/
izi.prototype.museumsData = function (cityUuid, key/*, callback*/) { // added for waterfall
  var url = 'https://cors-anywhere.herokuapp.com/https://api.izi.travel/cities/' + cityUuid + '/children?languages=en&type=museum';
  return fetch(url, {
    headers: {
      "X-IZI-API-KEY": key
    }
  })
  .then(response => response.json())
  .then(data => {
    for(var i = 0; i < data.length && i < 2; i++) {
      museumUuid[i] = data[i].uuid;
    }
    // callback(null, museumUuid, key, 0); // added for waterfall, might need to change depending on for loop
  })
  .catch(error => console.error(error))
}

/* 
  museumData takes in museumUuid, api key, and museumCount
  defines imageUuid, contentProviderUuid, and imageFile based on the previous two
*/
izi.prototype.museumData = function (museumUuid, key, museumCount) {
  var url = 'https://cors-anywhere.herokuapp.com/https://api.izi.travel/mtgobjects/' + museumUuid + '?languages=en&form=full&except=children';
  return fetch(url, {
    headers: {
      "X-IZI-API-KEY": key,
      "origin": "http://localhost"
    }
  })
  .then(response => {response.json().then(function(data) {
    // console.log("this is audio information:", data[0].content[0]); //.audio
    iziObject.iziOriginal.push(data[0]);
    iziObject.iziTitle.push(data[0].content[0].title);
    iziObject.iziType.push(data[0].type);
    iziObject.iziDescription.push(data[0].content[0].desc);
    iziObject.iziLatitude.push(data[0].location.latitude);
    iziObject.iziLongitude.push(data[0].location.longitude);
    iziObject.iziPhoneNumber.push(data[0].contacts.phone_number);
    iziObject.iziWebsite.push(data[0].contacts.website);
    iziObject.iziCountry.push(data[0].contacts.country);
    iziObject.iziCity.push(data[0].contacts.city);
    iziObject.iziAddress.push(data[0].contacts.address);
    iziObject.iziAddress.push(data[0].schedule);
    
    
    imageUuid.push(data[0].content[0].images[0].uuid); 
    contentProviderUuid.push(data[0].content_provider.uuid);
    iziObject.imageFile.push("https://media.izi.travel/" + contentProviderUuid[museumCount] + "/" + imageUuid[museumCount] + "_800x600.jpg");
    // callback(null, iziObject); //added for waterfall
  }).catch(error => console.log("ERROR: " + error))})
  .catch(error => console.log("ERROR: " + error))
}

/*
  iziCall takes in a cityName and an api key
  returns an object of multiple museums
*/
izi.prototype.iziCall = function (city, key, callback) {
  return new Promise(resolve => {
    this.cityData(city, key);
    that = this;
    setTimeout(function() {console.log('this is the uuid of the city', cityUuid);}, 20000);
    setTimeout(function() {that.museumsData(cityUuid, key);}, 20001);
    setTimeout(function() {console.log("this is the uuid of the museum", museumUuid);}, 40000);
    setTimeout(function() {
      for(var i = 0; i < museumUuid.length; i++){
          that.museumData(museumUuid[i], key, i);      
      }
    }, 40001);
    setTimeout(function() {
      console.log("this is callback: ", callback());
      resolve(callback());
    }, 60000);
  });
}

var iziApi = new izi();

async function asyncCall(city, key, callback) {
  console.log('calling');
  var iziTest = await iziApi.iziCall(city, key, callback);
  console.log("this is the async test: ", iziTest);
}

function iziCallback() {
  return iziObject;
}

module.exports = iziApi;





