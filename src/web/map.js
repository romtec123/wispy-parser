const fs = require('fs');
const blocked_macs = ['7C:A7:B0:39:E5:B6', 'F6:24:70:86:AD:22'] //for blocking my stuff in every scan 


async function view(req, config) {
    let files = fs.readdirSync(config.dataDir+'/conv')
    let markers = {arr: []}

    files.forEach(rawFile => {
        if(rawFile == '.DS_Store' || !rawFile.includes('.txt')) return;
        let data = fs.readFileSync(config.dataDir+`/conv/${rawFile}`)
        try{
            data = JSON.parse(data);
            let temp = {}
            temp.scanInfo = data.scanName + '<br><br>'
            temp.loc = data.loc
            
            let hiddenCount = 0
            for (let ap in data.aps) {
                if(data.aps[ap][0]){
                    if(!data.aps[ap][0].ssid){
                        hiddenCount++
                    } else {
                        if(!blocked_macs.includes(data.aps[ap][0].mac)) temp.scanInfo += `${data.aps[ap][0].ssid} - ${data.aps[ap][0].mac}<br>`
                    }
                }
            }
            temp.scanInfo += `${hiddenCount} hidden SSIDs`

            markers.arr.push(temp)
        } catch(err){console.log(err)}
    });


    let resp = `
<style>
#map {
    height: 100%;
}

html, body {
    height: 100%;
    margin: 0;
    padding: 0;
}
</style>


<body>
<div id="map"></div>

<script async
    src="https://maps.googleapis.com/maps/api/js?key=${config.mapApiKey}&callback=initMap">
</script>

<script>
let map;

let markers = ${JSON.stringify(markers)}

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  map = new Map(document.getElementById("map"), {
    center: { lat: 38.297804, lng: -122.286865 },
    zoom: 12,
  });
  const infoWindow = new google.maps.InfoWindow();

  // Create the markers.
  markers.arr.forEach(scan => {
    let lat = parseFloat(scan.loc.split(',')[0])
    let lng = parseFloat(scan.loc.split(',')[1])
    const marker = new google.maps.Marker({
      position: {lat, lng},
      map,
      title: scan.scanInfo,
      optimized: true,
    });

    // Add a click listener for each marker, and set up the info window.
    marker.addListener("click", () => {
      infoWindow.close();
      infoWindow.setContent(marker.getTitle());
      infoWindow.open(marker.getMap(), marker);
    });
  });
}

initMap();
</script>

</body>



    `
    return resp;
}
module.exports = {view}