const fs = require('fs');
async function view(req, config) {
    let files = fs.readdirSync(config.dataDir+'/raw')
    let markers = []
    files.forEach(rawFile => {
        if(rawFile == '.DS_Store' || !rawFile.includes('.txt')) return;
        if(fs.existsSync(config.dataDir+`/conv/${rawFile}`)) return;
        let data = fs.readFileSync(config.dataDir+`/raw/${rawFile}`, 'utf8')
        let apData = {aps:{}}
        apData.scanName = rawFile.split('.txt').join();
        apData.loc = data.split("\n")[0].split("=")[1];
        data.split('\n').splice(0,1).join('\n')
        data.split("          Cell ").forEach(network => {
            try{
                if(!network) return
                let lines = network.split('                    ').join().split('\n')
                if(lines[0] && lines[0].replace(/ /gi, "") == null) lines.shift();
    
                let response = {}
                response.mac = lines[0].split("Address: ")[1] ?? null
                response.ssid = lines[1].split("ESSID:")[1] ? lines[1].split("ESSID:")[1].replace(/"/gi, "") : ""
                response.freq = lines[2].split("Frequency:")[1] ?? null
                if(!response.mac) return
    
                if(!apData.aps[response.mac]) {
                    apData.aps[response.mac] = [response]
                } else {
                    let dupe = false;
                    apData.aps[response.mac].forEach(resp => {
                        if(!dupe) {
                            if (resp.ssid == response.ssid){
                                dupe = true;
                            }
                        }
                    })
    
                    if(!dupe) apData.aps[response.mac].push(response)
                }
            
            } catch(err){console.log(err)}
        });
        
        fs.writeFileSync(config.dataDir+`/conv/${rawFile}`, JSON.stringify(apData, null, 2))
        markers.push(apData)
        
    })
    let resp = `
        Converted ${markers.length} new files!
    `
    return resp;
}
module.exports = {view}