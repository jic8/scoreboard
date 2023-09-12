import toml
from flask import Flask
from flask import render_template
app = Flask(__name__)

# read config
config_file = toml.load("config.toml")
brokers = config_file["broker"]
count_robots = config_file.get("clients").get("count_robots")

# Create context for jinga
context = {
    "brokers": brokers,
    "count_robots": count_robots,
}

@app.route('/')
def main():
    return render_template('index.html', context=context)

if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 5000)