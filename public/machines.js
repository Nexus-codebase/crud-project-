let currentMode = 'expressions';
let currentRequest = '';
let requestInProgress = false;
let machineIsOn = false;
const expressionEmojis = [
  '😀',
  '😁',
  '😂',
  '😅',
  '😆',
  '😉',
  '😋',
  '😎',
  '😍',
  '😥',
  '😭',
  '😱',
  '🤓',
  '😴',
  '🤐',
  '💩',
];
const animalEmojis = [
  '🐶',
  '🐱',
  '🐼',
  '🐨',
  '🐷',
  '🐵',
  '🐭',
  '🐹',
  '🐰',
  '🐢',
  '🐸',
  '🐴',
  '🦄',
  '🐍',
  '🐙',
  '💩',
];
const expressionEmojisHtml = expressionEmojis
  .map((emoji) => `<option value="${emoji}">${emoji}</option>`)
  .join('');
const animalEmojisHtml = animalEmojis
  .map((emoji) => `<option value="${emoji}">${emoji}</option>`)
  .join('');
const emojiSelects = {
  expressions: expressionEmojisHtml,
  animals: animalEmojisHtml,
};

const defaultEmojiByMode = {
  expressions: expressionEmojis[0],
  animals: animalEmojis[0],
};

const activeMachineImage = {
  expressions:
    'https://content.codecademy.com/courses/learn-express-routes/machine-active.svg',
  animals:
    'https://content.codecademy.com/courses/learn-express-routes/server-machine-animals.svg',
};

const activeSingularRouteImage = {
  expressions:
    'https://content.codecademy.com/courses/learn-express-routes/expression-route-active.svg',
  animals:
    'https://content.codecademy.com/courses/learn-express-routes/animal-route-active.svg',
};

const activePluralRouteImage = {
  expressions:
    'https://content.codecademy.com/courses/learn-express-routes/expressions-route-active.svg',
  animals:
    'https://content.codecademy.com/courses/learn-express-routes/animals-route-active.svg',
};

const useClientFallbackApi =
  window.location.hostname.endsWith('github.io') ||
  window.location.protocol === 'file:';
const fallbackStorageKey = 'express-yourself-fallback-v1';

function createFallbackSeed() {
  return {
    expressions: [
      { id: 1, emoji: '😀', name: 'happy' },
      { id: 2, emoji: '😎', name: 'shades' },
      { id: 3, emoji: '😴', name: 'sleepy' },
    ],
    animals: [
      { id: 1, emoji: '🐶', name: 'Pupper' },
      { id: 2, emoji: '🐍', name: 'Snek' },
      { id: 3, emoji: '🐱', name: 'Maru' },
    ],
  };
}

function getFallbackState() {
  try {
    const raw = localStorage.getItem(fallbackStorageKey);
    if (!raw) {
      const seed = createFallbackSeed();
      localStorage.setItem(fallbackStorageKey, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.expressions || !parsed.animals) {
      const seed = createFallbackSeed();
      localStorage.setItem(fallbackStorageKey, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch (error) {
    const seed = createFallbackSeed();
    localStorage.setItem(fallbackStorageKey, JSON.stringify(seed));
    return seed;
  }
}

function saveFallbackState(state) {
  localStorage.setItem(fallbackStorageKey, JSON.stringify(state));
}

function toSafeId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function fallbackGetById(type, id) {
  const numericId = toSafeId(id);
  if (!numericId) {
    return null;
  }
  const state = getFallbackState();
  return state[type].find((item) => item.id === numericId) || null;
}

function fallbackCreate(type, name, emoji) {
  if (!name || !emoji) {
    return null;
  }
  const state = getFallbackState();
  const list = state[type];
  const nextId = list.length
    ? Math.max(...list.map((item) => item.id)) + 1
    : 1;
  const created = { id: nextId, name, emoji };
  list.push(created);
  saveFallbackState(state);
  return created;
}

function fallbackUpdate(type, id, name, emoji) {
  const numericId = toSafeId(id);
  if (!numericId) {
    return null;
  }
  const state = getFallbackState();
  const index = state[type].findIndex((item) => item.id === numericId);
  if (index === -1) {
    return null;
  }
  if (name) {
    state[type][index].name = name;
  }
  if (emoji) {
    state[type][index].emoji = emoji;
  }
  saveFallbackState(state);
  return state[type][index];
}

function fallbackDelete(type, id) {
  const numericId = toSafeId(id);
  if (!numericId) {
    return false;
  }
  const state = getFallbackState();
  const index = state[type].findIndex((item) => item.id === numericId);
  if (index === -1) {
    return false;
  }
  state[type].splice(index, 1);
  saveFallbackState(state);
  return true;
}

function fallbackGetAll(type) {
  const state = getFallbackState();
  return state[type];
}

$(document).ready(() => {
  setMode('expressions');
  pingMachine();
  setInterval(pingMachine, 1000);

  $('#get-expression').on('click', function () {
    selectExpressionMode('GET');
  });

  $('#create-expression').on('click', function () {
    selectExpressionMode('CREATE');
  });

  $('#update-expression').on('click', function () {
    selectExpressionMode('UPDATE');
  });

  $('#delete-expression').on('click', function () {
    selectExpressionMode('DELETE');
  });

  $('.expression-form .button').on('click', function () {
    triggerExpressionRequest();
  });

  $('#expressions-information .button').on('click', function () {
    triggerExpressionsRequest();
  });

  $('#expression-machine-type').on('click', function () {
    setMode('expressions');
  });

  $('#animals-machine-type').on('click', function () {
    setMode('animals');
  });
});

function setMode(mode) {
  if (mode !== 'expressions' && mode !== 'animals') {
    return;
  }
  currentMode = mode;
  if (useClientFallbackApi) {
    activateMachine();
  }
  pingMachine();
  $('#emoji-field').html(emojiSelects[currentMode]);
  selectExpressionMode('GET');
}

const generateRoute = (id, name, emoji) => {
  if (id && name && emoji) {
    return `/${currentMode}/${id}?name=${name}&emoji=${emoji}`;
  } else if (id) {
    return `/${currentMode}/${id}`;
  } else if (name && emoji) {
    return `/${currentMode}?name=${name}&emoji=${emoji}`;
  }
  return `/${currentMode}`;
};

const getInactiveMode = () => {
  return currentMode === 'animals' ? 'expressions' : 'animals';
};

function pingMachine() {
  if (requestInProgress) {
    return;
  }

  if (useClientFallbackApi) {
    activateMachine();
    if (
      $('#expression-route').attr('src') !==
      activeSingularRouteImage[currentMode]
    ) {
      $('#expression-route').attr('src', activeSingularRouteImage[currentMode]);
      $('#expressions-route').attr('src', activePluralRouteImage[currentMode]);
      activateExpressions();
    }
    return;
  }

  $.ajax('/', {
    success: function () {
      activateMachine();
      if (
        $('#expression-route').attr('src') ===
          activeSingularRouteImage[getInactiveMode()] ||
        $('#expression-route').attr('src') ===
          'https://content.codecademy.com/courses/learn-express-routes/expression-route-inactive.svg'
      ) {
        $('#expression-route').attr('src', activeSingularRouteImage[currentMode]);
        $('#expressions-route').attr('src', activePluralRouteImage[currentMode]);
        activateExpressions();
      }
    },
    error: function (xhr) {
      if (xhr.status !== 404) {
        activateMachine();
        if (
          $('#expression-route').attr('src') ===
            activeSingularRouteImage[getInactiveMode()] ||
          $('#expression-route').attr('src') ===
            'https://content.codecademy.com/courses/learn-express-routes/expression-route-inactive.svg'
        ) {
          $('#expression-route').attr('src', activeSingularRouteImage[currentMode]);
          $('#expressions-route').attr('src', activePluralRouteImage[currentMode]);
          activateExpressions();
        }
      } else {
        deactivateMachine();
        deactivateExpressions();
        $('#expression-route').attr(
          'src',
          'https://content.codecademy.com/courses/learn-express-routes/expression-route-inactive.svg'
        );
        $('#expressions-route').attr(
          'src',
          'https://content.codecademy.com/courses/learn-express-routes/expressions-route-inactive.svg'
        );
      }
    },
  });
}

function activateMachine() {
  machineIsOn = true;
  $('#server-machine').attr('src', activeMachineImage[currentMode]);
  $('#beaker').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/beaker-active-neutral.svg'
  );

  if (
    $('#lightbulb').attr('src') ===
    'https://content.codecademy.com/courses/learn-express-routes/lightbulb-inactive.svg'
  ) {
    $('#lightbulb').attr(
      'src',
      'https://content.codecademy.com/courses/learn-express-routes/lightbulb-active.svg'
    );
  }
}

function deactivateMachine() {
  machineIsOn = false;
  currentRequest = '';
  $('.expression-form').css('display', 'none');
  $('#expression-information .tabs li').removeClass('active');
  $('#expressions-information .tabs').html('');
  $('#server-machine').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/server-machine-inactive.svg'
  );
  $('#lightbulb').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/lightbulb-inactive.svg'
  );
  $('#beaker').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/beaker-inactive.svg'
  );
  $('#code-number').text('');
  $('#code-description').text('');
  clearExpressionText();
  clearExpressionsText();
}

function activateExpressions() {
  $('#expression-information').removeClass('inactive');
  $('#expressions-information').removeClass('inactive');
}

function deactivateExpressions() {
  $('#expression-information').addClass('inactive');
  $('#expressions-information').addClass('inactive');
}

function selectExpressionMode(mode) {
  if (!machineIsOn && !useClientFallbackApi) {
    return;
  }

  currentRequest = mode;
  $('.expression-form').css('display', 'block');
  $('#expression-information .tabs li').removeClass('active');
  $('#id-field').prop('readonly', false).removeClass('disabled').val('');
  $('#name-field').prop('readonly', false).removeClass('disabled').val('');
  if (mode === 'GET') {
    $('#emoji-field').prop('disabled', false).removeClass('disabled').val('');
    $('#get-expression').addClass('active');
    $('#name-field').prop('readonly', true).addClass('disabled');
    $('#emoji-field').prop('disabled', true).addClass('disabled');
  } else if (mode === 'CREATE') {
    $('#emoji-field')
      .prop('disabled', false)
      .removeClass('disabled')
      .val(defaultEmojiByMode[currentMode]);
    $('#create-expression').addClass('active');
    $('#id-field').prop('readonly', true).addClass('disabled');
  } else if (mode === 'UPDATE') {
    $('#emoji-field')
      .prop('disabled', false)
      .removeClass('disabled')
      .val(defaultEmojiByMode[currentMode]);
    $('#update-expression').addClass('active');
  } else if (mode === 'DELETE') {
    $('#emoji-field').prop('disabled', false).removeClass('disabled').val('');
    $('#delete-expression').addClass('active');
    $('#name-field').prop('readonly', true).addClass('disabled');
    $('#emoji-field').prop('disabled', true).addClass('disabled');
  }
}

function triggerExpressionRequest() {
  if (requestInProgress || (!machineIsOn && !useClientFallbackApi)) {
    return;
  }

  requestInProgress = true;
  deactivateExpressions();

  const id = $('#id-field').val();
  const name = $('#name-field').val();
  const emoji = $('#emoji-field').val();

  $('#expression-route').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/expression-route-pending.svg'
  );
  $('#expressions-route').attr('src', activePluralRouteImage[currentMode]);
  $('#code-number').text('');
  $('#code-description').text('');
  clearExpressionsText();
  setExpressionRequestText(id, name, emoji);
  const animationDelay = 428.5;
  animateMachine(animationDelay);
  setTimeout(() => makeExpressionRequest(id, name, emoji), animationDelay * 4);
}

function setExpressionRequestText(id, name, emoji) {
  switch (currentRequest) {
    case 'GET':
      $('#expression-text pre').eq(0).text('GET');
      $('#expression-text pre').eq(1).text(`/${currentMode}/${id}`);
      $('#expression-text pre').eq(2).text('');
      $('#expression-text pre').eq(3).text('');
      break;
    case 'CREATE':
      $('#expression-text pre').eq(0).text('POST');
      $('#expression-text pre').eq(1).text(`/${currentMode}`);
      $('#expression-text pre').eq(2).text(`?name=${name}`);
      $('#expression-text pre').eq(3).text(`&emoji=${emoji}`);
      break;
    case 'UPDATE':
      $('#expression-text pre').eq(0).text('PUT');
      $('#expression-text pre').eq(1).text(`/${currentMode}/${id}`);
      $('#expression-text pre').eq(2).text(`?name=${name}`);
      $('#expression-text pre').eq(3).text(`&emoji=${emoji}`);
      break;
    case 'DELETE':
      $('#expression-text pre').eq(0).text('DELETE');
      $('#expression-text pre').eq(1).text(`/${currentMode}/${id}`);
      $('#expression-text pre').eq(2).text('');
      $('#expression-text pre').eq(3).text('');
      break;
  }
}

function clearExpressionText() {
  $('#expression-text pre').eq(0).text('');
  $('#expression-text pre').eq(1).text('');
  $('#expression-text pre').eq(2).text('');
  $('#expression-text pre').eq(3).text('');
}

function clearExpressionsText() {
  $('#expressions-text pre').eq(0).text('');
  $('#expressions-text pre').eq(1).text('');
}

function makeExpressionRequest(id, name, emoji) {
  if (useClientFallbackApi) {
    switch (currentRequest) {
      case 'GET': {
        const expression = fallbackGetById(currentMode, id);
        if (expression) {
          animateGoodExpressionRequest('200', 'OK', expression);
        } else {
          animateBadExpressionRequest('404', 'Not Found');
        }
        break;
      }
      case 'CREATE': {
        const created = fallbackCreate(currentMode, name, emoji);
        if (created) {
          animateGoodExpressionRequest('200', 'OK', created);
        } else {
          animateBadExpressionRequest('400', 'Bad Request');
        }
        break;
      }
      case 'UPDATE': {
        const updated = fallbackUpdate(currentMode, id, name, emoji);
        if (updated) {
          animateGoodExpressionRequest('200', 'OK', updated);
        } else {
          animateBadExpressionRequest('404', 'Not Found');
        }
        break;
      }
      case 'DELETE': {
        const deleted = fallbackDelete(currentMode, id);
        if (deleted) {
          animateGoodExpressionRequest('204', 'No Content');
        } else {
          animateBadExpressionRequest('404', 'Not Found');
        }
        break;
      }
    }
    return;
  }

  switch (currentRequest) {
    case 'GET':
      $.ajax(generateRoute(id), {
        success: function (expression) {
          animateGoodExpressionRequest('200', 'OK', expression);
        },
        error: function () {
          animateBadExpressionRequest('404', 'Not Found');
        },
      });
      break;
    case 'CREATE':
      $.ajax(generateRoute(null, name, emoji), {
        method: 'POST',
        success: function (expression) {
          animateGoodExpressionRequest('200', 'OK', expression);
        },
        error: function () {
          animateBadExpressionRequest('400', 'Bad Request');
        },
      });
      break;
    case 'UPDATE':
      $.ajax(generateRoute(id, name, emoji), {
        method: 'PUT',
        success: function (expression) {
          animateGoodExpressionRequest('200', 'OK', expression);
        },
        error: function () {
          animateBadExpressionRequest('404', 'Not Found');
        },
      });
      break;
    case 'DELETE':
      $.ajax(generateRoute(id), {
        method: 'DELETE',
        success: function () {
          animateGoodExpressionRequest('204', 'No Content');
        },
        error: function () {
          animateBadExpressionRequest('404', 'Not Found');
        },
      });
      break;
  }
}

function triggerExpressionsRequest() {
  if (requestInProgress || (!machineIsOn && !useClientFallbackApi)) {
    return;
  }

  requestInProgress = true;
  deactivateExpressions();

  $('#expression-route').attr('src', activeSingularRouteImage[currentMode]);
  $('#expressions-route').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/expressions-route-pending.svg'
  );
  $('#code-number').text('');
  $('#code-description').text('');
  clearExpressionText();
  setExpressionsRequestText();
  const animationDelay = 428.5;
  animateMachine(animationDelay);
  setTimeout(() => makeExpressionsRequest(), animationDelay * 4);
}

function setExpressionsRequestText() {
  $('#expressions-text pre').eq(0).text('GET');
  $('#expressions-text pre').eq(1).text(`/${currentMode}`);
}

function makeExpressionsRequest() {
  if (useClientFallbackApi) {
    animateGoodExpressionsRequest('200', 'OK', fallbackGetAll(currentMode));
    return;
  }

  $.ajax(generateRoute(), {
    success: function (expressions) {
      animateGoodExpressionsRequest('200', 'OK', expressions);
    },
    error: function () {
      animateBadExpressionsRequest('404', 'Not Found');
    },
  });
}

function animateMachine(animationDelay) {
  $('#beaker').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/beaker-pending.svg'
  );
  $('#lightbulb').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/lightbulb-pending.svg'
  );
  $('#sliders')
    .queue(function (next) {
      $(this).attr(
        'src',
        'https://content.codecademy.com/courses/learn-express-routes/sliders-active-1.svg'
      );
      next();
    })
    .delay(animationDelay)
    .queue(function (next) {
      $(this).attr(
        'src',
        'https://content.codecademy.com/courses/learn-express-routes/sliders-active-2.svg'
      );
      next();
    })
    .delay(animationDelay)
    .queue(function (next) {
      $(this).attr(
        'src',
        'https://content.codecademy.com/courses/learn-express-routes/sliders-active-1.svg'
      );
      next();
    })
    .delay(animationDelay)
    .queue(function (next) {
      $(this).attr(
        'src',
        'https://content.codecademy.com/courses/learn-express-routes/sliders-active-2.svg'
      );
      next();
    })
    .delay(animationDelay)
    .queue(function (next) {
      $(this).attr(
        'src',
        'https://content.codecademy.com/courses/learn-express-routes/sliders-inactive.svg'
      );
      next();
    });
  $('#buttons')
    .queue(function (next) {
      $(this).attr(
        'src',
        'https://content.codecademy.com/courses/learn-express-routes/buttons-active-1.svg'
      );
      next();
    })
    .delay(animationDelay)
    .queue(function (next) {
      $(this).attr(
        'src',
        'https://content.codecademy.com/courses/learn-express-routes/buttons-active-2.svg'
      );
      next();
    })
    .delay(animationDelay)
    .queue(function (next) {
      $(this).attr(
        'src',
        'https://content.codecademy.com/courses/learn-express-routes/buttons-active-1.svg'
      );
      next();
    })
    .delay(animationDelay)
    .queue(function (next) {
      $(this).attr(
        'src',
        'https://content.codecademy.com/courses/learn-express-routes/buttons-active-2.svg'
      );
      next();
    })
    .delay(animationDelay)
    .queue(function (next) {
      $(this).attr(
        'src',
        'https://content.codecademy.com/courses/learn-express-routes/buttons-inactive.svg'
      );
      next();
    });
}

function animateGoodExpressionRequest(statusCode, statusDescription, response) {
  animateGoodRequest(statusCode, statusDescription);
  $('#expression-route').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/expression-route-green.svg'
  );
  if (currentRequest === 'DELETE') {
    $('#id-field').val('');
  } else {
    $('#id-field').val(response.id);
    $('#name-field').val(response.name);
    $('#emoji-field').val(response.emoji);
  }
}

function animateGoodExpressionsRequest(statusCode, statusDescription, response) {
  animateGoodRequest(statusCode, statusDescription);
  $('#expressions-route').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/expressions-route-green.svg'
  );
  const expressions = response;
  const $expressionTabs = $('#expressions-information .tabs').html('');
  for (let i = 0; i < expressions.length; i++) {
    $expressionTabs.append(
      `<li><p>${expressions[i].emoji}</p><p class="id">${expressions[i].id}</p></li>`
    );
  }
}

function animateGoodRequest(statusCode, statusDescription) {
  $('#lightbulb').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/lightbulb-green.svg'
  );
  $('#status-code').removeClass('bad-status').addClass('good-status');
  $('#code-number').text(statusCode);
  $('#code-description').text(statusDescription);
  activateExpressions();
  requestInProgress = false;
}

function animateBadExpressionRequest(statusCode, statusDescription) {
  animateBadRequest(statusCode, statusDescription);
  $('#expression-route').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/expression-route-red.svg'
  );
}

function animateBadExpressionsRequest(statusCode, statusDescription) {
  animateBadRequest(statusCode, statusDescription);
  $('#expressions-route').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/expressions-route-red.svg'
  );
}

function animateBadRequest(statusCode, statusDescription) {
  $('#lightbulb').attr(
    'src',
    'https://content.codecademy.com/courses/learn-express-routes/lightbulb-red.svg'
  );
  $('#status-code').removeClass('good-status').addClass('bad-status');
  $('#code-number').text(statusCode);
  $('#code-description').text(statusDescription);
  activateExpressions();
  requestInProgress = false;
}
