import logging

# Создаем логгер
logger = logging.getLogger('my_logger')
logger.setLevel(logging.DEBUG)

# Создаем обработчик для записи логов в файл
file_handler = logging.FileHandler('my_log.log')

# Создаем обработчик для вывода логов в консоль
console_handler = logging.StreamHandler()

# Устанавливаем уровень логирования для каждого обработчика
file_handler.setLevel(logging.INFO)
console_handler.setLevel(logging.DEBUG)

# Создаем форматтер для логов
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Добавляем обработчики к логгеру
logger.addHandler(file_handler)
logger.addHandler(console_handler)


def write_log (data):
    status = data['level']
    if status == 'info':
        logger.info(data['message'])
    elif status == 'warning':
        logger.warning(data['message'])
    elif status == 'error':
        logger.error(data['message'])