'use strict';

(function() {

  const dependencies = {
    data: window.data
  };

  const MSG = document.querySelector(`.${dependencies.data.MSG_CLASS}`)

  function showErrorMessage(error) {
    MSG.textContent = error;
    MSG.classList.add(`${dependencies.data.MSG_SHOW_CLASS}`);
  }

  function showEmptyMessage() {
    MSG.textContent = 'Нет результатов';
    MSG.classList.add(`${dependencies.data.MSG_SHOW_CLASS}`);
  }

  function removeEmptyMessage() {
    MSG.classList.remove(`${dependencies.data.MSG_SHOW_CLASS}`);
  }

  window.message = {
    showErrorMessage: showErrorMessage,
    showEmptyMessage: showEmptyMessage,
    removeEmptyMessage: removeEmptyMessage
  };

})();
