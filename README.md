# MyParty
----------

Программа выполнена на framework nodeJS Express.

Для установки стянуть репозиторий или скачать и распаковать архив, перейти в корень проекта.

Создать базу с названием `myparty` и создать таблицу выполниы скрипт:
```
  CREATE TABLE myparty.friends(
   id   INT              NOT NULL AUTO_INCREMENT,
   vk_id   INT              NOT NULL,
   name VARCHAR (20)     NOT NULL,
   photo  VARCHAR (120) ,
   go_to_party  VARCHAR (20) NOT NULL,
   beverages  VARCHAR (20) NOT NULL, 
   PRIMARY KEY (id)
);
```

В `MyParty/config.json` выполнить все необходимые настройки:
- `adminid` - ID админа, он же ID VK
- `adminemail` -E-mail админа
- `dbconnection` - конфигурации для подключения к базе
- `auth` - настройки приложения в VK
- `mailer` - настройки почтового сервера, необходим для отправки автоматических сообщений админу

В командной строке выполнить
```
  npm install
  node app.js
```
Перейти по ссылке `http://localhost:8000` 

Для быстрого входа в систесу желательно предварительно залогиниться в VK.
