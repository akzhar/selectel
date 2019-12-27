(function () {
  const MIN = 2;
  const MAX = 12;
  const STEP = 2;
  const AVAILABLE_RESULTS = [2, 4, 6, 8, 10, 12];
  const UNIT = 'ядер';
  const BAR = document.querySelector('#bar');
  const TOGGLE = BAR.querySelector('#toggle');
  const OUTPUT = document.querySelector('#output');
  const SCALE_COLOR = '#E5E5E5';
  const SCALE_COLOR_FILL = '#2F93FE';

  let toggleShift = 0;
  let barWidth = BAR.offsetWidth;
  let scalePrice = Math.round(barWidth / (MAX - MIN));

  function getTogglePosition(endPosition) {
    let barClientCoords = BAR.getBoundingClientRect();
    let newPosition = endPosition - barClientCoords.left + pageXOffset - toggleShift;
    if(newPosition < 0) newPosition = 0;
    if(newPosition > barWidth) newPosition = barWidth;
    return newPosition;
  };

  function moveToggle(position) {
    TOGGLE.style.left = `${position}px`;
  };

  function writeResult(result) {
    OUTPUT.innerText = `${result} ${UNIT}`;
  };

  function fillBar(persents) {
    BAR.style.background = `linear-gradient(to right ,${SCALE_COLOR_FILL} 0%, ${SCALE_COLOR_FILL} ${persents}%, ${SCALE_COLOR} ${persents}%, ${SCALE_COLOR} 100%)`;
  };

  function defineToggleShift(startPosition) {
    let toggleClientCoords = TOGGLE.getBoundingClientRect();
    toggleShift = startPosition - toggleClientCoords.left + pageXOffset;
  };

  function onDocumentMouseUp() {
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
  };

  function onDocumentMouseMove(evt) {
    let endPosition = evt.pageX;
    let newPosition = getTogglePosition(endPosition);
    let result = Math.round(newPosition / scalePrice) + MIN;
    let persents = Math.round(newPosition / barWidth * 100);
    if (AVAILABLE_RESULTS.includes(result)) {
      moveToggle(newPosition);
      writeResult(result);
      fillBar(persents);
    }
  };

  function onToggleMouseDown(evt) {
    let startPosition = evt.pageX;
    defineToggleShift(startPosition);
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mouseup', onDocumentMouseUp);
  };

  function onWindowResize() {
    barWidth = BAR.offsetWidth;
    scalePrice = Math.round(barWidth / (MAX - MIN));
  };

  TOGGLE.addEventListener('mousedown', onToggleMouseDown);
  window.addEventListener('resize', onWindowResize);
})();
