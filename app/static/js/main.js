let mqttClient;

// our MQTT broker
// get client url from DOM
let url = document.querySelector('[data-url]').dataset.url
let host = `ws://${url}/`;

let options = {
    clientId: 'mr_' + Math.random().toString(16).substring(2, 8),
    username: mqtt.username,
    password: mqtt.password,
    useSSL: false,
    protocolId: 'MQTT',
    protocolVersion: 5,
    rejectUnauthorized: false,
    clean: true,
    reconnectPeriod: 20000,
    connectTimeout: 30 * 1000,
    protocol: 'mqtt',
};

mqttClient = mqtt.connect(host, options);

mqttClient.on("error", (err) => {
    console.log("Error: ", err);
    mqttClient.end();
});

mqttClient.on("reconnect", () => {
    console.log("Reconnecting...");
});

mqttClient.on("connect", () => {
    console.log("Client connected:" + options.clientId);
});

// Received Message
mqttClient.on("message", (topic, message) => {
    topic = topic.split("/");

    topic[0] !== 'robot' && 'This is not robot';
    message && (message = new TextDecoder().decode(message))

    let robotId = topic[1];
    let robotOption = topic[2];
    let robotElement = document.querySelector(`[data-robot="${robotId}"]`);
 

    let setRobotState = (el, state) => {
        el.innerHTML = state;
    }
    
    let setRobotTime = (el, state) => {
        el.innerHTML = state;
    }


    // parse option robot
    switch (robotOption) {
        case "washing-time-left":
            if(message === '*'){
                setRobotTime(robotElement.querySelector('.time'), 'Мойка окончена')
                break;
            }
            if(message < 1){
                setRobotTime(robotElement.querySelector('.time'), 'Менее минуты')
                
            } else {
                setRobotTime(robotElement.querySelector('.time'), `${formatMinutes(message)}`)
            }
            break;
        case 'state':
            switch (message) {
                case '0':
                    setRobotState(robotElement.querySelector('.state'), 'Свободен')
                    break;
                case '1':
                    setRobotState(robotElement.querySelector('.state'), 'Занят')
                    break;
                case '2':
                    setRobotState(robotElement.querySelector('.state'), 'Недоступен')
                    break;
            }
            break;
    }

});

// Subscribe on topics
mqttClient.subscribe('#', { qos: 0 });


// DOM manipulation
let listRobotsWrapper = document.querySelector(".wrapper");

// slider status
setInterval(() => {
    let robots = document.querySelectorAll('.robot')
    robots.forEach(robot => {
        // check if now robot not free
        if(robot.querySelector(".state").innerHTML !== 'Свободен'){
            let hideElement = robot.querySelector('.hide');
            let robotOption = hideElement.classList[0];

            switch (robotOption) {
                case 'state':
                    robot.querySelector('.time').classList.add("hide")
                    hideElement.classList.remove("hide")
                    break;
            
                case 'time':
                    robot.querySelector('.state').classList.add("hide")
                    hideElement.classList.remove("hide")
                    break;
            }
        }
    });
}, 3000)


let formatMinutes = (minutes) => {
    let number = minutes % 100;
    let lastDigit = number % 10;
  
    if (number >= 11 && number <= 19) {
      return minutes + ' минут';
    } else if (lastDigit === 1) {
      return minutes + ' минута';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      return minutes + ' минуты';
    } else {
      return minutes + ' минут';
    }
}