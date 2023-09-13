import toml
from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify
from logger import write_log

app = Flask(__name__)

# read config
config_file = toml.load("config.toml")
brokers = config_file["broker"]
count_robots = config_file.get("robots").get("count")
arrow_direction = config_file.get("robots").get("direction")
slider_time = config_file.get("robots").get("slider_time")


def seconds_to_milliseconds(milliseconds):
    seconds = milliseconds * 1000
    return seconds

# Create context for Jinga
context = {
    "brokers": brokers,
    "count_robots": count_robots,
    "arrow_direction": arrow_direction,
    "slider_time": seconds_to_milliseconds(slider_time),
}

@app.route('/')
def main():
    return render_template('index.html', context=context)


# Создаем путь для приема логов с фронтенда
@app.route('/log', methods=['POST'])
def receive_logs():
    if request.method == 'POST':
        log_data = request.json  # Получаем данные лога из JSON-запроса

        # Делаем что-то с данными лога (например, записываем в файл или базу данных)
        # В этом примере мы просто выводим логи в консоль
        write_log(log_data)

        return jsonify({'message': 'Логи успешно приняты'}), 200
    else:
        return jsonify({'message': 'Метод не поддерживается'}), 405


if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 5000)