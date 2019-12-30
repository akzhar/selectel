'use strict';

(function () {

  const dependencies = {
    data: window.data,
    utils: window.utils,
    cards: window.cards,
    message: window.message,
    rangeControl: window.rangeControl
  };

  const FILTERS_CONTAINER = document.querySelector(`.${dependencies.data.FILTERS_CLASS}`);
  const RANGE_BAR = document.querySelector(`#${dependencies.data.RANGE_BAR_ID}`);
  const RANGE_TOGGLE = RANGE_BAR.querySelector(`#${dependencies.data.RANGE_TOGGLE_ID}`);
  const FilterFunction = {
    'bar-js': checkCoresCount,
    'toggle-js': checkCoresCount,
    'gpu-js': checkGPU,
    'raid-js': checkRAID,
    'ssd-js': checkSSD
  };
  let FiltersState = {};
  let dataToBeFiltered = [];

  FILTERS_CONTAINER.addEventListener('change', onFiltersChange);
  RANGE_TOGGLE.addEventListener('mousedown', onFiltersChange);
  RANGE_BAR.addEventListener('click', onFiltersChange);

  function filterData(callback, filterValue) {
    let filteredData = dataToBeFiltered;
    if (filterValue !== dependencies.data.FILTER_ANY_VALUE) {
      filteredData = dataToBeFiltered.filter(function (it) {
        return callback(it, filterValue);
      });
    }
    dataToBeFiltered = filteredData;
  }

  function checkCoresCount(it, value) {
    let condition = it.cpu.cores * it.cpu.count === value;
    return condition ? it : null;
  }

  function checkGPU(it) {
    let condition = Object.prototype.hasOwnProperty.call(it, 'gpu');
    return condition ? it : null;
  }

  function checkRAID(it) {
    let condition = it.disk.count >= 2;
    return condition ? it : null;
  }

  function checkSSD(it) {
    let condition = it.disk.type === 'SSD';
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

  function onFiltersChange(evt) {
    dataToBeFiltered = dependencies.data.SERVER_DATA;
    let filter = evt.target;
    let key = filter.id;
    if (key === 'bar-js' || key === 'toggle-js') {
      FiltersState[key] = dependencies.rangeControl.getValue();
    } else {
      FiltersState[key] = filter.value;
    }
    if (filter.checked === false) FiltersState[key] = dependencies.data.FILTER_ANY_VALUE;
    for (let filterKey in FiltersState) {
      if (Object.prototype.hasOwnProperty.call(FiltersState, filterKey)) {
        let callback = FilterFunction[filterKey];
        let filterValue = FiltersState[filterKey];
        filterData(callback, filterValue);
      }
    }
    dependencies.utils.debounce(renderFilteredCards)();
  }

  function filterByDefault() {
    dataToBeFiltered = dependencies.data.SERVER_DATA;
    FiltersState['bar-js'] = dependencies.data.START_VCPU_COUNT;
    let callback = FilterFunction['bar-js'];
    let filterValue = FiltersState['bar-js'];
    filterData(callback, filterValue);
    renderFilteredCards();
  }

  window.filters = {
    filterByDefault: filterByDefault
  };

})();
