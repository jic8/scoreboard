class MQTTClient {
    constructor(brokerUrl) {
        const options = {
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

        this.client = mqtt.connect(brokerUrl, options);
        
        this.client.on('connect', () => {
            const textLog = `'MQTT клиент подключен ', ${brokerUrl}`;
            const logData = {
                level: 'info',
                message:textLog,
            };
          
          sendLogToBackend(logData);
          console.log(textLog)
        });

        this.client.on("error", (err) => {
            const textLog = `'Error: ', ${err}`;
            const logData = {
                level: 'error',
                message:textLog,
            };

            sendLogToBackend(logData);
            console.log(message)
            this.client.end();
        });
        
        this.client.on("reconnect", () => {
            const textLog = 'Reconnecting...';
            const logData = {
                level: 'warning',
                message: textLog,
            };

            sendLogToBackend(logData);
            console.log(message)
        });
        
        this.client.on('message', (topic, message) => {
            const textLog = `Получено сообщение на топике ${topic}: ${message}`;
            const logData = {
                level: 'info',
                message: textLog,
            };

            sendLogToBackend(logData);
            console.log(textLog)

            messageHandler(topic, message)
        });
    }

    subscribe(topic) {
        this.client.subscribe(topic);
        const textLog = `Подписка на топик ${topic}`;
            const logData = {
                level: 'info',
                message:textLog,
            };

        sendLogToBackend(logData);
        console.log(textLog)
    }
  }

// Получение ссылки на скрипт
const scriptTag = document.querySelector('script[src*="mainClass.js"]');

// Получение URL из атрибута src
const src = scriptTag.getAttribute('src');

const splitParams = src.split("?")
const brokerParamsString = splitParams[1].replace(/'/g,'"')
const brokerParams = JSON.parse(brokerParamsString)
const timeSlider = splitParams[2]

brokerParams.forEach(broker => {
// создание класса MQTTClient
  const client = new MQTTClient(`ws://${broker.mqtt_host}:${broker.mqtt_port}`);
  client.subscribe('#', { qos: 0 });
});

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
        let robotTime = robot.querySelector(".time").innerHTML
        
        if(robotStatus === 'Недоступен' || robotStatus === 'Свободен'){
            robot.querySelector('.time').classList.add('hide')
        }

        if(robotStatus === 'Занят' && robotTime !== '---'){
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

const restart = restartInterval(sliderEngine, timeSlider); // Запустить интервал с функцией sliderEngine и задержкой в timeSlider миллисекунд

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

const messageHandler = (topic, message) => {

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
                robotElement.querySelector('.time').innerHTML = 'Мойка окончена';
                break;
            }
            if(message < 1){
                robotElement.querySelector('.time').innerHTML =  'Менее минуты';
                
            } else {
                robotElement.querySelector('.time').innerHTML = `${formatMinutes(message)}`;
            }
            break;
        case 'state':
            switch (message) {
                case '0':
                    robotElement.querySelector('.state').innerHTML = 'Свободен';
                    robotElement.querySelector('.state').style.color = "green";
                    break;
                case '1':
                    robotElement.querySelector('.state').innerHTML =  'Занят';
                    robotElement.querySelector('.state').style.color = "orange";
                    break;
                case '2':
                    robotElement.querySelector('.state').innerHTML =  'Недоступен';
                    robotElement.querySelector('.state').style.color = "red";
                    break;
            }
            break;
    }

    // reset slider after new topic
    restart()
}

// Rotate arrow
const rotateArrow = (el, angle) => {
    el.style.transform = `rotate(${angle}deg)`;
}

(() => {
    const arrows = document.querySelectorAll('.arrow');
    arrows.forEach(arrow => {
        // get class direction
        const direction = arrow.classList[1]
        // set rotation
        switch (direction) {
            case "R":
                rotateArrow(arrow, 90)
                break;
            case "L":
                rotateArrow(arrow, -90)
                break;
            case "D":
                rotateArrow(arrow, 180)
                break;
        }
    });
})()


// send logs on backend
function sendLogToBackend(logData) {
    const url = `/log`; // URL серверного эндпоинта для приема логов.
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    };
  
    fetch(url, options)
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка при отправке логов на бэкенд');
        }
        return response.json();
      })
      .then(data => {
        console.log('Логи успешно отправлены на бэкенд:', data.message);
      })
      .catch(error => {
        console.error('Ошибка при отправке логов:', error);
      });
  }
  