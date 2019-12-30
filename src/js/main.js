'use strict';

(function() {

  const dependencies = {
    data: window.data,
    backend: window.backend,
    message: window.message,
    cards: window.cards,
    filters: window.filters
  };

  const METHOD = 'GET';
  const CATALOG = document.querySelector(`.${dependencies.data.CATALOG_CLASS}`);
  const LOADER = CATALOG.querySelector(`#${dependencies.data.LOADER_ID}`);

  dependencies.backend.load(onLoad, onError, METHOD);

  function onLoad(response) {
    CATALOG.removeChild(LOADER);
    dependencies.data.SERVER_DATA = JSON.parse(response);
    dependencies.filters.filterByDefault();
  }

  function onError(error) {
    CATALOG.removeChild(LOADER);
    dependencies.message.showErrorMessage(error);
  }

})();
