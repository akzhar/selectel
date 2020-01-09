'use strict';

(function () {
  var DEBOUNCE_INTERVAL = 500;
  var lastTimeout;

  function debounce(cb) {
    return function () {
      var parameters = arguments;

      if (lastTimeout) {
        window.clearTimeout(lastTimeout);
      }

      lastTimeout = window.setTimeout(function () {
        cb.apply(null, parameters);
      }, DEBOUNCE_INTERVAL);
    };
  }

  function getDeclinatedTitleByNumber(number, titles) {
    var cases = [2, 0, 1, 1, 1, 2];
    return titles[number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]];
  }

  window.utils = {
    debounce: debounce,
    getDeclinatedTitleByNumber: getDeclinatedTitleByNumber
  };
})();
'use strict';

(function () {
  window.data = {
    SERVER_DATA: [],
    DEFAULT_FILTER_VCPU_COUNT: 6,
    FILTER_ANY_VALUE: 'any',
    CATALOG_CLASS: 'catalog__content',
    FILTERS_CLASS: 'filters',
    LOADER_ID: 'loader',
    PRICE_UNIT: '₽/месяц',
    SELECTEL_URL: 'https://selectel.ru/',
    OUTPUT_CLASS: 'filters',
    RANGE_BAR_ID: 'bar-js',
    RANGE_TOGGLE_ID: 'toggle-js',
    RANGE_OUTPUT_ID: 'cpu-js',
    MSG_CLASS: 'catalog__message',
    MSG_SHOW_CLASS: 'catalog__message--show'
  };
})();
'use strict';

(function () {
  var dependencies = {
    utils: window.utils,
    data: window.data
  };
  var STEP = 2; // must be >= 1

  var MIN = 2;
  var MAX = 12;
  var EXCEPTIONS = [10];
  var UNIT_TITLES = ['ядро', 'ядра', 'ядер'];
  var RANGE_BAR = document.querySelector("#".concat(dependencies.data.RANGE_BAR_ID));
  var RANGE_TOGGLE = RANGE_BAR.querySelector("#".concat(dependencies.data.RANGE_TOGGLE_ID));
  var RANGE_OUTPUT = document.querySelector("#".concat(dependencies.data.RANGE_OUTPUT_ID));
  var SCALE_COLOR = '#E5E5E5';
  var SCALE_COLOR_FILL = '#2F93FE';
  var toggleShift = 0;
  var barWidth = 0;
  var stepWidth = 0;
  var availableValues = [];
  defineAvailableValues();
  updateVariables();
  RANGE_TOGGLE.addEventListener('mousedown', onToggleMouseDown);
  RANGE_BAR.addEventListener('click', onRangeBarClick);
  window.addEventListener('resize', onWindowResize);
  forceMoveToggleToValue(dependencies.data.DEFAULT_FILTER_VCPU_COUNT);

  function defineAvailableValues() {
    for (var val = MIN; val <= MAX; val += STEP) {
      if (!(EXCEPTIONS.indexOf(val) !== -1)) availableValues.push(val);
    }
  }

  function updateVariables() {
    barWidth = RANGE_BAR.offsetWidth;
    stepWidth = barWidth / (availableValues.length - 1);
  }

  function getTogglePosFromCursorPos(cursorPosition) {
    var barClientCoords = RANGE_BAR.getBoundingClientRect();
    var togglePositionOnBar = cursorPosition - barClientCoords.left + pageXOffset - toggleShift;
    return togglePositionOnBar;
  }

  function checkBarLimits(togglePositionOnBar) {
    if (togglePositionOnBar < 0) return 0;
    if (togglePositionOnBar > barWidth) return barWidth;
    return togglePositionOnBar;
  }

  function moveToggle(position) {
    RANGE_TOGGLE.style.left = "".concat(position, "px");
  }

  function writeValue(result) {
    RANGE_OUTPUT.value = "".concat(result, " ").concat(dependencies.utils.getDeclinatedTitleByNumber(result, UNIT_TITLES));
  }

  function getValue() {
    var spacePos = RANGE_OUTPUT.value.indexOf(' ');
    return +RANGE_OUTPUT.value.slice(0, spacePos);
  }

  function fillBar(persents) {
    RANGE_BAR.style.background = "linear-gradient(to right ,".concat(SCALE_COLOR_FILL, " 0%, ").concat(SCALE_COLOR_FILL, " ").concat(persents, "%, ").concat(SCALE_COLOR, " ").concat(persents, "%, ").concat(SCALE_COLOR, " 100%)");
  }

  function defineToggleShift(startPosition) {
    var toggleClientCoords = RANGE_TOGGLE.getBoundingClientRect();
    toggleShift = startPosition - toggleClientCoords.left + pageXOffset;
  }

  function onDocumentMouseUp() {
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
  }

  function calcToggleMove(evt) {
    var cursorPosition = evt.clientX;
    var newTogglePositionOnBar = getTogglePosFromCursorPos(cursorPosition);
    newTogglePositionOnBar = checkBarLimits(newTogglePositionOnBar);
    var result = Math.round(newTogglePositionOnBar / barWidth * 100) * (MAX - MIN) / 100 + MIN;

    for (var i = 0; i < EXCEPTIONS.length; i++) {
      if (EXCEPTIONS[i] - result >= 0 && EXCEPTIONS[i] - result <= STEP / 2) {
        result = EXCEPTIONS[i] - STEP;
      } else if (result - EXCEPTIONS[i] >= 0 && result - EXCEPTIONS[i] <= STEP / 2) {
        result = EXCEPTIONS[i] + STEP;
      }
    }

    for (var _i = 0; _i < availableValues.length; _i++) {
      if (availableValues[_i] - result >= 0 && availableValues[_i] - result <= STEP / 2 || result - availableValues[_i] >= 0 && result - availableValues[_i] <= STEP / 2) {
        result = availableValues[_i];
      }
    }

    newTogglePositionOnBar = availableValues.indexOf(result) * stepWidth;
    newTogglePositionOnBar = checkBarLimits(newTogglePositionOnBar);
    var persents = Math.round(newTogglePositionOnBar / barWidth * 100);

    if (availableValues.indexOf(result) !== -1) {
      moveToggle(newTogglePositionOnBar);
      writeValue(result);
      fillBar(persents);
    }
  }

  function forceMoveToggleToValue(value) {
    var togglePositionOnBar = availableValues.indexOf(value) * stepWidth;
    var persents = Math.round(togglePositionOnBar / barWidth * 100);
    moveToggle(togglePositionOnBar);
    writeValue(value);
    fillBar(persents);
  }

  function onToggleMouseDown(evt) {
    var startPosition = evt.pageX;
    defineToggleShift(startPosition);
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mouseup', onDocumentMouseUp);
  }

  function onWindowResize() {
    updateVariables();
    var currentValue = getValue();
    forceMoveToggleToValue(currentValue);
  }

  function onDocumentMouseMove(evt) {
    calcToggleMove(evt);
  }

  function onRangeBarClick(evt) {
    calcToggleMove(evt);
  }

  window.rangeControl = {
    getValue: getValue
  };
})();
'use strict';

(function () {
  var MAX_RESPONSE_TIME = 5000;
  var MS_PER_SECOND = 1000;
  var TIME_UNIT = 'cек';
  var OK_STATUS = 200;
  var Url = {
    GET: 'https://api.jsonbin.io/b/5df3c10a2c714135cda0bf0f/1'
  };

  function load(onLoad, onError, method, data) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
      if (xhr.status === OK_STATUS) {
        onLoad(xhr.response);
      } else {
        onError("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F, \u0441\u0442\u0430\u0442\u0443\u0441 \u043E\u0442\u0432\u0435\u0442\u0430: ".concat(xhr.status, " ").concat(xhr.statusText));
      }
    });
    xhr.addEventListener('error', function () {
      onError('Ошибка соединения');
    });
    xhr.addEventListener('timeout', function () {
      onError("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F, \u0437\u0430\u043F\u0440\u043E\u0441 \u043D\u0435 \u0443\u0441\u043F\u0435\u043B \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C\u0441\u044F \u0437\u0430 ".concat(xhr.timeout / MS_PER_SECOND, " ").concat(TIME_UNIT));
    });
    xhr.open(method, Url[method], true);
    xhr.timeout = MAX_RESPONSE_TIME;
    xhr.send(data);
  }

  window.backend = {
    load: load
  };
})();
'use strict';

(function () {
  var dependencies = {
    data: window.data
  };
  var MSG = document.querySelector(".".concat(dependencies.data.MSG_CLASS));

  function showErrorMessage(error) {
    MSG.textContent = error;
    MSG.classList.add("".concat(dependencies.data.MSG_SHOW_CLASS));
  }

  function showEmptyMessage() {
    MSG.textContent = 'Нет результатов';
    MSG.classList.add("".concat(dependencies.data.MSG_SHOW_CLASS));
  }

  function removeEmptyMessage() {
    MSG.classList.remove("".concat(dependencies.data.MSG_SHOW_CLASS));
  }

  window.message = {
    showErrorMessage: showErrorMessage,
    showEmptyMessage: showEmptyMessage,
    removeEmptyMessage: removeEmptyMessage
  };
})();
'use strict';

(function () {
  var dependencies = {
    data: window.data
  };
  var CATALOG = document.querySelector(".".concat(dependencies.data.CATALOG_CLASS));

  function render(data) {
    var fragment = document.createDocumentFragment();
    data.forEach(function (cardData) {
      var card = create(cardData);
      fragment.appendChild(card);
    });
    CATALOG.appendChild(fragment);
  }

  function create(cardData) {
    var card = document.createElement('div');
    card.classList.add('product');
    var head = document.createElement('h3');
    head.classList.add('product__head');
    var container = document.createElement('div');
    container.classList.add('product__attributes');
    var attrCpu = document.createElement('div');
    attrCpu.classList.add('product__attr');
    attrCpu.classList.add('product__attr--cpu');
    var attrRam = document.createElement('div');
    attrRam.classList.add('product__attr');
    attrRam.classList.add('product__attr--ram');
    var attrMemory = document.createElement('div');
    attrMemory.classList.add('product__attr');
    attrMemory.classList.add('product__attr--memory');
    var wrapper = document.createElement('div');
    wrapper.classList.add('product__wrapper');
    var price = document.createElement('p');
    price.classList.add('product__price');
    var priceValue = document.createElement('b');
    priceValue.classList.add('product__price-value');
    var priceUnit = document.createElement('b');
    priceUnit.classList.add('product__price-unit');
    priceUnit.textContent = dependencies.data.PRICE_UNIT;
    var orderBtn = document.createElement('a');
    orderBtn.classList.add('product__orderbtn');
    orderBtn.classList.add('btn');
    orderBtn.href = dependencies.data.SELECTEL_URL;
    orderBtn.target = 'blank';
    orderBtn.textContent = 'Заказать'; // данные

    head.textContent = cardData.name;
    var count = '';
    if (cardData.cpu.cores >= 2) count = "".concat(cardData.cpu.count, " x ");
    var cpuName = cardData.cpu.name;
    var lastSpacePos = cpuName.lastIndexOf(' ');
    var temp = cpuName.split('');
    temp.splice(lastSpacePos, 1, '<br> ');
    cpuName = temp.join('');
    var cores = cardData.cpu.cores * cardData.cpu.count;
    attrCpu.innerHTML = "".concat(count).concat(cpuName, ", ").concat(cores, " \u044F\u0434\u0435\u0440");
    attrRam.textContent = cardData.ram;
    var disksCount = '';
    if (cardData.disk.count >= 2) disksCount = "".concat(cardData.disk.count, " x ");
    attrMemory.textContent = "".concat(disksCount).concat(cardData.disk.value, " \u0413\u0411 ").concat(cardData.disk.type);
    var priceStr = "".concat(cardData.price / 100);

    if (priceStr.length > 3) {
      temp = priceStr.split('');
      temp.splice(priceStr.length - 3, 0, ' ');
      priceStr = temp.join('');
    }

    priceValue.textContent = priceStr; //

    container.appendChild(attrCpu);
    container.appendChild(attrRam);
    container.appendChild(attrMemory);
    price.appendChild(priceValue);
    price.appendChild(priceUnit);
    wrapper.appendChild(price);
    wrapper.appendChild(orderBtn);
    container.appendChild(wrapper);
    card.appendChild(head);
    card.appendChild(container);
    return card;
  }

  function removeAll() {
    var cards = CATALOG.querySelectorAll('.product');
    Array.prototype.forEach.call(cards, function (card) {
      CATALOG.removeChild(card);
    });
  }

  window.cards = {
    render: render,
    removeAll: removeAll
  };
})();
'use strict';

(function () {
  var dependencies = {
    data: window.data,
    utils: window.utils,
    cards: window.cards,
    message: window.message,
    rangeControl: window.rangeControl
  };
  var FILTERS_CONTAINER = document.querySelector(".".concat(dependencies.data.FILTERS_CLASS));
  var RANGE_BAR = document.querySelector("#".concat(dependencies.data.RANGE_BAR_ID));
  var RANGE_TOGGLE = RANGE_BAR.querySelector("#".concat(dependencies.data.RANGE_TOGGLE_ID));
  var FilterFunction = {
    'range': checkCoresCount,
    'gpu-js': checkGPU,
    'raid-js': checkRAID,
    'ssd-js': checkSSD
  };
  var FiltersState = {};
  var dataToBeFiltered = [];
  FILTERS_CONTAINER.addEventListener('change', onCheckboxFilterChange);
  RANGE_TOGGLE.addEventListener('mousedown', onRangeToggleMouseDown);
  RANGE_BAR.addEventListener('click', onRangeBarClick);

  function onRangeBarClick() {
    onRangeFilterChange();
  }

  function onRangeToggleMouseDown() {
    document.addEventListener('mouseup', onRangeFilterChange);
  }

  function filterData() {
    dataToBeFiltered = dependencies.data.SERVER_DATA;

    for (var filterKey in FiltersState) {
      if (Object.prototype.hasOwnProperty.call(FiltersState, filterKey)) {
        (function () {
          var callback = FilterFunction[filterKey];
          var filterValue = FiltersState[filterKey];
          var filteredData = dataToBeFiltered;

          if (filterValue !== dependencies.data.FILTER_ANY_VALUE) {
            filteredData = dataToBeFiltered.filter(function (it) {
              return callback(it, filterValue);
            });
          }

          dataToBeFiltered = filteredData;
        })();
      }
    }

    dependencies.utils.debounce(renderFilteredCards)();
  }

  function checkCoresCount(it, value) {
    var condition = it.cpu.cores * it.cpu.count === value;
    return condition ? it : null;
  }

  function checkGPU(it) {
    var condition = Object.prototype.hasOwnProperty.call(it, 'gpu');
    return condition ? it : null;
  }

  function checkRAID(it) {
    var condition = it.disk.count >= 2;
    return condition ? it : null;
  }

  function checkSSD(it) {
    var condition = it.disk.type === 'SSD';
    return condition ? it : null;
  }

  function renderFilteredCards() {
    dependencies.cards.removeAll();

    if (dataToBeFiltered.length === 0) {
      dependencies.message.showEmptyMessage();
    } else {
      dependencies.message.removeEmptyMessage();
      dependencies.cards.render(dataToBeFiltered);
    }
  }

  function onRangeFilterChange() {
    FiltersState['range'] = dependencies.rangeControl.getValue();
    filterData();
    document.removeEventListener('mouseup', onRangeFilterChange);
  }

  function onCheckboxFilterChange(evt) {
    var filter = evt.target;
    var key = filter.id;
    FiltersState[key] = filter.value;
    if (filter.checked === false) FiltersState[key] = dependencies.data.FILTER_ANY_VALUE;
    filterData();
  }

  function filterByDefault() {
    FiltersState['range'] = dependencies.data.DEFAULT_FILTER_VCPU_COUNT;
    filterData();
  }

  window.filters = {
    filterByDefault: filterByDefault
  };
})();
'use strict';

(function () {
  var dependencies = {
    data: window.data,
    backend: window.backend,
    message: window.message,
    cards: window.cards,
    filters: window.filters
  };
  var METHOD = 'GET';
  var CATALOG = document.querySelector(".".concat(dependencies.data.CATALOG_CLASS));
  var LOADER = CATALOG.querySelector("#".concat(dependencies.data.LOADER_ID));
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