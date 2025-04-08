const fs = require("fs");
const path = require("path");
const rootPath = path.resolve(__dirname, "..");

const regex = /^(?!\/)[a-z0-9_-]+$/g;
const url = '';


if (!regex.test(url)) {
  console.log('NAO CUMPRE')
} else {
  console.log('CUMPRE')
}