const util = require('util');
const exec = util.promisify(require("child_process").exec);
console.log("Hello world!");

console.log(process.env.MQTT_URI);


const searchDevices = async (devices) => {
    let toFind = devices;
    let found = [];

    const { stdout, stderr } = await exec("nmap --max-rate 100 -sP 192.168.1.0/24");
    const lines = stdout.split("\n");
    lines.forEach((line) => {
        toFind.forEach((device, idx) => {
            if(line.includes(device.internetName)) {
                delete toFind[idx];
                found.push(device);
            }
        });
    });

    return found;
};

const found = searchDevices([{internetName: "OnePlus-6T"}, {internetName: 'BlaBla'}]);
found.then("Found: ", console.log);



