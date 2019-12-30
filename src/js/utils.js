'use strict';

(function () {

  let DEBOUNCE_INTERVAL = 500;
  let lastTimeout;

  function debounce(cb) {
    return function () {
      let parameters = arguments;
      if (lastTimeout) {
        window.clearTimeout(lastTimeout);
      }
      lastTimeout = window.setTimeout(function () {
        cb.apply(null, parameters);
      }, DEBOUNCE_INTERVAL);
    };
  }

  window.utils = {
    debounce: debounce
  };
})();
