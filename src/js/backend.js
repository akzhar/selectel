'use strict';

(function () {

  const MAX_RESPONSE_TIME = 5000;
  const MS_PER_SECOND = 1000;
  const TIME_UNIT = 'cек';
  const OK_STATUS = 200;
  const Url = {
    // GET: 'https://api.jsonbin.io/b/5df3c10a2c714135cda0bf0f/1'
    GET: 'https://api.jsonbin.io/b/5e08fa8df9369177b27484fa'
  };

  function load(onLoad, onError, method, data) {
    let xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function () {
      if (xhr.status === OK_STATUS) {
        onLoad(xhr.response);
      } else {
        onError(`Ошибка соединения, статус ответа: ${xhr.status} ${xhr.statusText}`);
      }
    });
    xhr.addEventListener('error', function () {
      onError('Ошибка соединения');
    });
    xhr.addEventListener('timeout', function () {
      onError(`Ошибка соединения, запрос не успел выполниться за ${xhr.timeout / MS_PER_SECOND} ${TIME_UNIT}`);
    });
    xhr.open(method, Url[method], true);
    xhr.setRequestHeader('secret-key', '$2b$10$PJB9U7iJ7ytHYcfpTTNvJ./lH8zQor1GKkTgNRwy51cTnZi8lBZVS');
    xhr.timeout = MAX_RESPONSE_TIME;
    xhr.send(data);
  }

  window.backend = {
    load: load
  };

})();
