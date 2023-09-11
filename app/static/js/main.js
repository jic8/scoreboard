let mqttClient;

// our MQTT broker
// get client url from DOM
let url = document.querySelector('[data-url]').dataset.url
let host = `ws://${url}/`;


// this for reset slider
const restartInterval = (func, delay) => {
    let intervalId;

    const startInterval = () => intervalId = setInterval(func, delay);
    const stopInterval = () => clearInterval(intervalId);

    const restart = () => {
        stopInterval();
        startInterval();
    }

    startInterval();

    return restart;
}

// slider
let sliderEngine = () => {
    let robots = document.querySelectorAll('.robot')
    robots.forEach(robot => {
        // check if now robot not free
        let robotStatus = robot.querySelector(".state").innerHTML
        // let robotTime = robot.querySelector(".time").innerHTML

        if(robotStatus !== 'Свободен'){
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
}

const restart = restartInterval(sliderEngine, 3000); // Запустить интервал с функцией sliderEngine и задержкой 3000 миллисекунд

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

    // parse option robot
    switch (robotOption) {
        case "washing-time-left":
            if(message === '*'){
                robotElement.querySelector('.time').innerHTML = 'Мойка окончена'
                break;
            }
            if(message < 1){
                robotElement.querySelector('.time').innerHTML =  'Менее минуты'
                
            } else {
                robotElement.querySelector('.time').innerHTML = `${formatMinutes(message)}`
            }
            break;
        case 'state':
            switch (message) {
                case '0':
                    robotElement.querySelector('.state').innerHTML = 'Свободен'
                    break;
                case '1':
                    robotElement.querySelector('.state').innerHTML =  'Занят'
                    break;
                case '2':
                    robotElement.querySelector('.state').innerHTML =  'Недоступен'
                    break;
            }
            break;
    }

    // reset slider after new topic
    restart()
});

// Subscribe on topics
mqttClient.subscribe('#', { qos: 0 });


// DOM manipulation
let listRobotsWrapper = document.querySelector(".wrapper");


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