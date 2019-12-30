'use strict';

(function () {

  const dependencies = {
    data: window.data
  };

  const STEP = 2; // must be >= 1
  const MIN = 2;
  const MAX = 12;
  const EXCEPTIONS = [10];

  const UNIT = 'ядер';
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
  RANGE_BAR.addEventListener('click', onBarClick);
  window.addEventListener('resize', onWindowResize);

  forceMoveToggleToValue(dependencies.data.START_VCPU_COUNT);

  function defineAvailableValues() {
    let varCount = Math.ceil((MAX - MIN) / STEP + EXCEPTIONS.length);
    for(let i = 1; i <= varCount; i++) {
      let val = i * STEP;
      if (val < MIN) {
        varCount++;
        continue;
      }
      if (!EXCEPTIONS.includes(val)) availableValues.push(val);
    }
  }

  function updateVariables() {
    barWidth = RANGE_BAR.offsetWidth;
    stepWidth = barWidth / (STEP * (availableValues.length - 1));
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
    RANGE_OUTPUT.value = `${result} ${UNIT}`;
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
    let result = newTogglePositionOnBar / stepWidth + MIN;
    EXCEPTIONS.forEach(function(x) {
      if (result + STEP > x) result += STEP;
    });
    result = availableValues.find(function(x) {
      if ((x - result >= 0) && (x - result <= STEP / 2)) return x;
      if ((result - x >= 0) && (result - x <= STEP / 2)) return x;
    });
    newTogglePositionOnBar = (result - MIN) * stepWidth;
    newTogglePositionOnBar = checkBarLimits(newTogglePositionOnBar);
    let persents = Math.round(newTogglePositionOnBar / barWidth * 100);
    if (availableValues.includes(result)) {
      moveToggle(newTogglePositionOnBar);
      writeValue(result);
      fillBar(persents);
    }
  }

  function forceMoveToggleToValue(value) {
    let togglePositionOnBar = (value - MIN) * stepWidth;
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

  function onBarClick(evt) {
    calcToggleMove(evt);
  }

  window.rangeControl = {
    getValue: getValue
  };
})();
