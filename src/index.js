const fs = require('fs');
const express = require('express');
const app = express();

const defaultConfig = {
    mapApiKey: "",
    webPort: 4000,
    dataDir: "./data/raw"
}

if(!fs.existsSync('./config.json')){
    fs.writeFileSync('./config.json', JSON.stringify(defaultConfig, null, 2));
    console.log("Config file generated, please edit it and restart the app.");
    process.exit(1);
}

let config = null;
try{
    config = JSON.parse(fs.readFileSync("./config.json"));
}catch(err) {
    console.log("Couldn't load the config!");
    console.log(err)
    process.exit(1);
}

console.log(`WiSpy parser started at http://localhost:${config.webPort}/`)


app.listen(config.webPort);