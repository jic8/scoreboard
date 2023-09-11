import toml
from flask import Flask
from flask import render_template
app = Flask(__name__)

# read config
config_file = toml.load("config.toml")
server_url = config_file.get("server").get("server_url")
server_port = config_file.get("server").get("server_port")
full_server_url = "{}:{}".format(server_url, server_port)
count_robots = config_file.get("clients").get("count_robots")

context = {
    "full_server_url": full_server_url,
    "count_robots": count_robots,
}

@app.route('/')
def main():
    return render_template('index.html', context=context)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)