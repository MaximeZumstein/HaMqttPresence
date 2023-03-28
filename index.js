const util = require('util');
const exec = util.promisify(require("child_process").exec);
const mqtt = require('mqtt');

const cidr = "192.168.1.0/24";

const mqttClient = mqtt.connect(process.env.MQTT_URI, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
})

const haDiscovery = (device) => {
    mqttClient.publish(`homeassistant/binary_sensor/presence/${device.id}/config`, JSON.stringify({
        unique_id: device.id,
        name: device.personName,
        qos: 0,
        device_class: "presence",
        state_topic: `presence/${device.id}/state`
    }))
}

const searchDevices = async (devices) => {
    let toFind = [...devices];
    let found = [];
    const { stdout, stderr } = await exec(`nmap --max-rate 100 -sP ${cidr}`);
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

const sendPresence = (device, present) => {
    mqttClient.publish(`presence/${device.id}/state`, present ? "ON" : "OFF");
}

const devices = require('./devices.json');
devices.forEach(haDiscovery);

const loop = () => {
    searchDevices(devices)
    .then((found) => {
        found.forEach(device => sendPresence(device, true))
        const lost = devices.filter(device => !found.some((foundDevice) => (foundDevice.id == device.id)));
        lost.forEach(device => sendPresence(device, false))

        loop();
    });
}


loop();
