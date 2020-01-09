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

  function getDeclinatedTitleByNumber(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[ (number % 100 > 4 && number % 100 < 20) ? 2 : cases[ (number % 10 < 5) ? number % 10 : 5 ] ];
  }

  window.utils = {
    debounce: debounce,
    getDeclinatedTitleByNumber: getDeclinatedTitleByNumber
  };
})();
