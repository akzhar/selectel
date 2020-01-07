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
    'range': checkCoresCount,
    'gpu-js': checkGPU,
    'raid-js': checkRAID,
    'ssd-js': checkSSD
  };
  let FiltersState = {};
  let dataToBeFiltered = [];

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
    for (let filterKey in FiltersState) {
      if (Object.prototype.hasOwnProperty.call(FiltersState, filterKey)) {
        let callback = FilterFunction[filterKey];
        let filterValue = FiltersState[filterKey];
        let filteredData = dataToBeFiltered;
        if (filterValue !== dependencies.data.FILTER_ANY_VALUE) {
          filteredData = dataToBeFiltered.filter(function (it) {
            return callback(it, filterValue);
          });
        }
        dataToBeFiltered = filteredData;
      }
    }
    dependencies.utils.debounce(renderFilteredCards)();
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

  function onRangeFilterChange() {
    FiltersState['range'] = dependencies.rangeControl.getValue();
    filterData();
    document.removeEventListener('mouseup', onRangeFilterChange);
  }

  function onCheckboxFilterChange(evt) {
    let filter = evt.target;
    let key = filter.id;
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
