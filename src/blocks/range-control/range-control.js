'use strict';

(function () {

  const dependencies = {
    utils: window.utils,
    data: window.data
  };

  const STEP = 2; // must be >= 1
  const MIN = 2;
  const MAX = 12;
  const EXCEPTIONS = [10];

  const UNIT_TITLES = ['ядро', 'ядра', 'ядер'];
  const RANGE_BAR = document.querySelector(`#${dependencies.data.RANGE_BAR_ID}`);
  const RANGE_TOGGLE = RANGE_BAR.querySelector(`#${dependencies.data.RANGE_TOGGLE_ID}`);
  const RANGE_OUTPUT = document.querySelector(`#${dependencies.data.RANGE_OUTPUT_ID}`);
  const SCALE_COLOR = '#E5E5E5';
  const SCALE_COLOR_FILL = '#2F93FE';

  let toggleShift = 0;
  let barWidth = 0;
  let stepWidth = 0;
  let availableValues = [];
  defineAvailableValues();
  updateVariables();

  RANGE_TOGGLE.addEventListener('mousedown', onToggleMouseDown);
  RANGE_BAR.addEventListener('click', onRangeBarClick);
  window.addEventListener('resize', onWindowResize);

  forceMoveToggleToValue(dependencies.data.DEFAULT_FILTER_VCPU_COUNT);

  function defineAvailableValues() {
    for(let val = MIN; val <= MAX; val += STEP) {
      if (!EXCEPTIONS.includes(val)) availableValues.push(val);
    }
  }

  function updateVariables() {
    barWidth = RANGE_BAR.offsetWidth;
    stepWidth = barWidth / (availableValues.length - 1);
  }

  function getTogglePosFromCursorPos(cursorPosition) {
    let barClientCoords = RANGE_BAR.getBoundingClientRect();
    let togglePositionOnBar = cursorPosition - barClientCoords.left + pageXOffset - toggleShift;
    return togglePositionOnBar;
  }

  function checkBarLimits(togglePositionOnBar) {
    if(togglePositionOnBar < 0) return 0;
    if(togglePositionOnBar > barWidth) return barWidth;
    return togglePositionOnBar;
  }

  function moveToggle(position) {
    RANGE_TOGGLE.style.left = `${position}px`;
  }

  function writeValue(result) {
    RANGE_OUTPUT.value = `${result} ${dependencies.utils.getDeclinatedTitleByNumber(result, UNIT_TITLES)}`;
  }

  function getValue() {
    let spacePos = RANGE_OUTPUT.value.indexOf(' ');
    return +RANGE_OUTPUT.value.slice(0, spacePos);
  }

  function fillBar(persents) {
    RANGE_BAR.style.background = `linear-gradient(to right ,${SCALE_COLOR_FILL} 0%, ${SCALE_COLOR_FILL} ${persents}%, ${SCALE_COLOR} ${persents}%, ${SCALE_COLOR} 100%)`;
  }

  function defineToggleShift(startPosition) {
    let toggleClientCoords = RANGE_TOGGLE.getBoundingClientRect();
    toggleShift = startPosition - toggleClientCoords.left + pageXOffset;
  }

  function onDocumentMouseUp() {
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
  }

  function calcToggleMove(evt) {
    let cursorPosition = evt.clientX;
    let newTogglePositionOnBar = getTogglePosFromCursorPos(cursorPosition);
    newTogglePositionOnBar = checkBarLimits(newTogglePositionOnBar);
    let result = Math.round(newTogglePositionOnBar / barWidth * 100) * (MAX - MIN) / 100 + MIN;
    for(let i = 0; i < EXCEPTIONS.length; i++) {
      if (EXCEPTIONS[i] - result >= 0 && EXCEPTIONS[i] - result <= STEP / 2) {
        result = EXCEPTIONS[i] - STEP;
      } else if (result - EXCEPTIONS[i] >= 0 && result - EXCEPTIONS[i] <= STEP / 2) {
        result = EXCEPTIONS[i] + STEP;
      }
    }
    for(let i = 0; i < availableValues.length; i++) {
      if ((availableValues[i] - result >= 0 && availableValues[i] - result <= STEP / 2) ||
         (result - availableValues[i] >= 0 && result - availableValues[i] <= STEP / 2)) {
        result = availableValues[i];
      }
    }
    newTogglePositionOnBar = availableValues.indexOf(result) * stepWidth;
    newTogglePositionOnBar = checkBarLimits(newTogglePositionOnBar);
    let persents = Math.round(newTogglePositionOnBar / barWidth * 100);
    if (availableValues.includes(result)) {
      moveToggle(newTogglePositionOnBar);
      writeValue(result);
      fillBar(persents);
    }
  }

  function forceMoveToggleToValue(value) {
    let togglePositionOnBar = availableValues.indexOf(value) * stepWidth;
    let persents = Math.round(togglePositionOnBar / barWidth * 100);
    moveToggle(togglePositionOnBar)
    writeValue(value);
    fillBar(persents);
  }

  function onToggleMouseDown(evt) {
    let startPosition = evt.pageX;
    defineToggleShift(startPosition);
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mouseup', onDocumentMouseUp);
  }

  function onWindowResize() {
    updateVariables();
    let currentValue = getValue();
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
