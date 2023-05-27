const fs = require('fs');
const express = require('express');
const app = express();
const mapPage = require('./web/map')
const convertPage = require('./web/convert')
const statsPage = require('./web/stats')


const defaultConfig = {
    mapApiKey: "",
    webPort: 4000,
    dataDir: "./data"
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
    console.log(err);
    process.exit(1);
}

if(!fs.existsSync(config.dataDir)) fs.mkdirSync(config.dataDir)
if(!fs.existsSync(config.dataDir+'/raw')) fs.mkdirSync(config.dataDir+'/raw')
if(!fs.existsSync(config.dataDir+'/conv')) fs.mkdirSync(config.dataDir+'/conv')

/**
 * BEGIN ENDPOINTS
 */

app.get('/', (req, res) => {
    let resp = `
    WiSpy by Romtec<br>
    <a href="map">View Map</a><br>
    <a href="stats">View Stats</a><br>
    <a href="convert">Convert Raw</a><br>
    `
    res.send(resp);
})

app.get('/map', async (req, res) => {
    let data = await mapPage.view(req, config)
    res.send(data)
});

app.get('/stats', async (req, res) => {
    let data = await statsPage.view(req, config)
    res.send(data)
});

app.get('/convert', async (req, res) => {
    let data = await convertPage.view(req, config)
    res.send(data)
});

/**
 * END ENDPOINTS
 */

app.listen(config.webPort, () => {
    console.log(`WiSpy parser started at http://localhost:${config.webPort}/`);
});