'use strict';

(function() {

  const dependencies = {
    data: window.data
  };

  const CATALOG = document.querySelector(`.${dependencies.data.CATALOG_CLASS}`);

  function render(data) {
    let fragment = document.createDocumentFragment();

    data.forEach(function(cardData) {
      let card = create(cardData);
      fragment.appendChild(card);
    });

    CATALOG.appendChild(fragment);
  }

  function create(cardData) {
    let card = document.createElement('div');
    card.classList.add('product');
    let head = document.createElement('h3');
    head.classList.add('product__head');
    let container = document.createElement('div');
    container.classList.add('product__attributes');
    let attrCpu = document.createElement('div');
    attrCpu.classList.add('product__attr');
    attrCpu.classList.add('product__attr--cpu');
    let attrRam = document.createElement('div');
    attrRam.classList.add('product__attr');
    attrRam.classList.add('product__attr--ram');
    let attrMemory = document.createElement('div');
    attrMemory.classList.add('product__attr');
    attrMemory.classList.add('product__attr--memory');
    let wrapper = document.createElement('div');
    wrapper.classList.add('product__wrapper');
    let price = document.createElement('p');
    price.classList.add('product__price');
    let priceValue = document.createElement('b');
    priceValue.classList.add('product__price-value');
    let priceUnit = document.createElement('b');
    priceUnit.classList.add('product__price-unit');
    priceUnit.textContent = dependencies.data.PRICE_UNIT;
    let orderBtn = document.createElement('a');
    orderBtn.classList.add('product__orderbtn');
    orderBtn.classList.add('btn');
    orderBtn.href = dependencies.data.SELECTEL_URL;
    orderBtn.target = 'blank';
    orderBtn.textContent = 'Заказать';
    // данные
    head.textContent = cardData.name;
    let coresCount = '';
    if (cardData.cpu.cores >= 2) coresCount = `${cardData.cpu.count} x `;
    let cpuName = cardData.cpu.name;
    let lastSpacePos = cpuName.lastIndexOf(' ');
    let temp = cpuName.split('');
    temp.splice(lastSpacePos, 1, '<br>');
    cpuName = temp.join('');
    attrCpu.innerHTML = `${coresCount}${cpuName}, ${cardData.cpu.cores} ядер`;
    attrRam.textContent = cardData.ram;
    let disksCount = '';
    if (cardData.disk.count >= 2) disksCount = `${cardData.disk.count} x `;
    attrMemory.textContent = `${disksCount}${cardData.disk.value} ГБ ${cardData.disk.type}`;
    let priceStr = `${cardData.price / 100}`;
    if (priceStr.length > 3) {
      temp = priceStr.split('');
      temp.splice(priceStr.length - 3, 0, ' ');
      priceStr = temp.join('');
    }
    priceValue.textContent = priceStr;
    //
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
    let cards = CATALOG.querySelectorAll('.product');
    cards.forEach(card => CATALOG.removeChild(card));
  }

  window.cards = {
    render: render,
    removeAll: removeAll
  };

})();
