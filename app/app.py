import toml
from flask import Flask
from flask import render_template
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

if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 5000)