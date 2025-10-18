const baseMapping = {
  'a': 'а',
  'b': 'б',
  'c': 'ч',
  'd': 'д',
  'e': 'є',
  'f': 'ф',
  'g': 'г',
  'h': 'х',
  'i': 'и',
  'j': 'џ',
  'k': 'к',
  'l': 'ʌ',
  'm': 'м',
  'n': 'н',
  'o': 'ѡ',
  'p': 'п',
  'q': 'й',
  'r': 'р',
  's': 'с',
  't': 'т',
  'u': 'ꙋ',
  'v': 'в',
  'w': 'ѧ',
  'x': 'ѯ',
  'y': 'ѵ',
  'z': 'з',
  'ă': 'ъ',
  'â': 'ѫ',
  'î': 'ꙟ',
  'ș': 'ш',
  'ț': 'ц'
};

const altMapping = {
  't': 'ѳ',
  'p': 'ѱ',
  'â': 'ѥ',
  'u': 'ю',
  'e': 'ѣ',
  'ș': 'щ',
  'o': 'о',
  'z': 'ѕ',
  'j': 'ж',
  'i': 'ї',
  'w': 'ѩ',
  'q': 'ꙋ̆'
};

const accentableCharacters = new Set([
  'а', 'є', 'и', 'ѡ', 'ꙋ', 'ѵ', 'ъ', 'ѫ', 'ꙟ', 'ѩ', 'ѧ', 'ѣ', 'ї', 'ѥ', 'ю', 'о'
]);

const combiningMarks = {
  "'": '\u0301',
  '`': '\u0300'
};

const digitToAccentKey = {
  Digit3: "'",
  Digit4: '`',
  Numpad3: "'",
  Numpad4: '`'
};

const deadKeyToAccentKey = {
  '˘': "'",
  'ˆ': '`'
};

const accentMarks = new Set(Object.values(combiningMarks));

function buildAccentPreview(label, accentKey) {
  if (!label || !accentKey) {
    return label;
  }

  const accentMark = combiningMarks[accentKey];
  if (!accentMark) {
    return label;
  }

  const chars = Array.from(label);
  if (chars.length === 0) {
    return label;
  }

  const base = chars[0];
  if (!accentableCharacters.has(base)) {
    return label;
  }

  let combining = '';
  let remainder = '';

  for (let index = 1; index < chars.length; index += 1) {
    const char = chars[index];
    if (isCombining(char) && !accentMarks.has(char)) {
      combining += char;
    } else {
      remainder += char;
    }
  }

  return base + combining + accentMark + remainder;
}

const codeToCharacterMap = {
  Semicolon: 'ș',
  Quote: 'ț',
  BracketLeft: 'ă',
  BracketRight: 'î',
  Backslash: 'â'
};

function isCombining(char) {
  if (!char) {
    return false;
  }
  const code = char.codePointAt(0);
  return code >= 0x300 && code <= 0x36f;
}

const rows = [
  [
    { type: 'standard', value: 'q' },
    { type: 'standard', value: 'w' },
    { type: 'standard', value: 'e' },
    { type: 'standard', value: 'r' },
    { type: 'standard', value: 't' },
    { type: 'standard', value: 'y' },
    { type: 'standard', value: 'u' },
    { type: 'standard', value: 'i' },
    { type: 'standard', value: 'o' },
    { type: 'standard', value: 'p' },
    { type: 'standard', value: 'ă' },
    { type: 'standard', value: 'î' }
  ],
  [
    { type: 'standard', value: 'a' },
    { type: 'standard', value: 's' },
    { type: 'standard', value: 'd' },
    { type: 'standard', value: 'f' },
    { type: 'standard', value: 'g' },
    { type: 'standard', value: 'h' },
    { type: 'standard', value: 'j' },
    { type: 'standard', value: 'k' },
    { type: 'standard', value: 'l' },
    { type: 'standard', value: 'ș' },
    { type: 'standard', value: 'ț' },
    { type: 'standard', value: 'â' }
  ],
  [
    { type: 'modifier', action: 'shift', label: '⇧' },
    { type: 'modifier', action: 'alt', label: '⌥' },
    { type: 'standard', value: 'z' },
    { type: 'standard', value: 'x' },
    { type: 'standard', value: 'c' },
    { type: 'standard', value: 'v' },
    { type: 'standard', value: 'b' },
    { type: 'standard', value: 'n' },
    { type: 'standard', value: 'm' },
    { type: 'accent', value: "'", label: '´', secondary: '3' },
    { type: 'accent', value: '`', label: '`', secondary: '4' },
    { type: 'action', action: 'backspace', label: '⌫', classes: ['key--control'] }
  ],
  [
    { type: 'action', action: 'space', label: 'Space', classes: ['key--space'] }
  ]
];

const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');

let shiftLatch = false;
let altLatch = false;
let shiftHeld = false;
let altHeld = false;
let accentLatch = null;
let accentHeld = null;
let suppressNativeInsert = false;
let suppressNativeInsertReset = null;

const standardKeyRefs = [];
const accentKeyRefs = [];

function isShiftActive() {
  return shiftLatch || shiftHeld;
}

function isAltActive() {
  return altLatch || altHeld;
}

function getActiveAccentKey() {
  return accentHeld || accentLatch;
}

function isAccentActive(value) {
  return getActiveAccentKey() === value;
}

function scheduleNativeInsertReset() {
  if (suppressNativeInsertReset !== null) {
    clearTimeout(suppressNativeInsertReset);
  }

  suppressNativeInsertReset = setTimeout(() => {
    suppressNativeInsert = false;
    suppressNativeInsertReset = null;
  }, 0);
}

function requestSuppressNativeInsert() {
  suppressNativeInsert = true;
  scheduleNativeInsertReset();
}

function uppercaseChar(char) {
  if (!char) {
    return char;
  }
  return char.toUpperCase();
}

function transliterate(inputChar, { useAlt, shift } = {}) {
  const lower = inputChar.toLowerCase();
  const activeAlt = useAlt && altMapping.hasOwnProperty(lower);
  const map = activeAlt ? altMapping : baseMapping;
  let result = map[lower];

  if (!result) {
    return shift ? uppercaseChar(inputChar) : inputChar;
  }

  if (shift) {
    result = uppercaseChar(result);
  }

  return result;
}

function insertText(text) {
  const start = output.selectionStart;
  const end = output.selectionEnd;
  const value = output.value;
  const before = value.slice(0, start);
  const after = value.slice(end);
  output.value = before + text + after;
  const cursor = start + text.length;
  output.setSelectionRange(cursor, cursor);
  output.focus();
}

function handleBackspace() {
  const start = output.selectionStart;
  const end = output.selectionEnd;

  if (start !== end) {
    const value = output.value;
    output.value = value.slice(0, start) + value.slice(end);
    output.setSelectionRange(start, start);
    output.focus();
    return;
  }

  if (start === 0) {
    return;
  }

  const value = output.value;
  const sliceStart = start - 1;
  output.value = value.slice(0, sliceStart) + value.slice(end);
  output.setSelectionRange(sliceStart, sliceStart);
  output.focus();
}

function applyAccent(markKey) {
  const accentMark = combiningMarks[markKey];
  if (!accentMark) {
    return false;
  }

  const start = output.selectionStart;
  const end = output.selectionEnd;

  if (start !== end) {
    return false;
  }

  const value = output.value;
  let index = start - 1;

  while (index >= 0 && isCombining(value[index])) {
    index -= 1;
  }

  if (index < 0) {
    return false;
  }

  const targetChar = value[index];
  if (!accentableCharacters.has(targetChar)) {
    return false;
  }

  const before = value.slice(0, index + 1);
  let combining = '';
  let scanIndex = index + 1;

  while (scanIndex < value.length && isCombining(value[scanIndex])) {
    const char = value[scanIndex];
    if (!accentMarks.has(char)) {
      combining += char;
    }
    scanIndex += 1;
  }

  const after = value.slice(scanIndex);
  output.value = before + combining + accentMark + after;
  const cursor = before.length + combining.length + accentMark.length;
  output.setSelectionRange(cursor, cursor);
  output.focus();
  return true;
}

function updateKeyLabels() {
  const shift = isShiftActive();
  const alt = isAltActive();
  const accentKey = getActiveAccentKey();

  standardKeyRefs.forEach(({ button, value }) => {
    const primary = button.querySelector('.key__primary');
    const secondary = button.querySelector('.key__secondary');
    let label = baseMapping[value] || value;

    if (alt && altMapping.hasOwnProperty(value)) {
      label = altMapping[value];
    }

    if (shift) {
      label = uppercaseChar(label);
    }

    if (accentKey) {
      label = buildAccentPreview(label, accentKey);
    }

    primary.textContent = label;
    secondary.textContent = shift ? uppercaseChar(value) : value;
  });

  const shiftButton = document.querySelector('[data-action="shift"]');
  const altButton = document.querySelector('[data-action="alt"]');
  if (shiftButton) {
    shiftButton.classList.toggle('key--active', isShiftActive());
  }
  if (altButton) {
    altButton.classList.toggle('key--active', isAltActive());
  }

  accentKeyRefs.forEach(({ button, value }) => {
    button.classList.toggle('key--active', isAccentActive(value));
  });
}

function createStandardKey(value) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'key';
  button.dataset.value = value;

  const primary = document.createElement('span');
  primary.className = 'key__primary';
  const secondary = document.createElement('span');
  secondary.className = 'key__secondary';

  button.appendChild(primary);
  button.appendChild(secondary);

  button.addEventListener('click', () => {
    handleCharacterInput(value);
  });

  standardKeyRefs.push({ button, value });
  return button;
}

function createModifierKey(action, label, classes = []) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = ['key', 'key--modifier', ...classes].join(' ');
  button.dataset.action = action;
  button.innerHTML = `<span class="key__primary">${label}</span>`;

  button.addEventListener('click', () => {
    if (action === 'shift') {
      shiftLatch = !shiftLatch;
    } else if (action === 'alt') {
      altLatch = !altLatch;
    }
    updateKeyLabels();
  });

  return button;
}

function createActionKey(action, label, classes = []) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = ['key', ...classes].join(' ');
  button.dataset.action = action;
  button.innerHTML = `<span class="key__primary">${label}</span>`;

  button.addEventListener('click', () => {
    switch (action) {
      case 'backspace':
        handleBackspace();
        break;
      case 'space':
        insertText(' ');
        break;
      default:
        break;
    }
    output.focus();
  });

  return button;
}

function createAccentKey(value, label, secondaryLabel) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'key key--accent';
  button.dataset.accent = value;
  const primary = document.createElement('span');
  primary.className = 'key__primary';
  primary.textContent = label;
  button.appendChild(primary);

  if (secondaryLabel) {
    const secondary = document.createElement('span');
    secondary.className = 'key__secondary';
    secondary.textContent = secondaryLabel;
    button.appendChild(secondary);
  }

  button.addEventListener('click', () => {
    const applied = applyAccent(value);
    if (!applied) {
      accentLatch = accentLatch === value ? null : value;
    } else {
      accentLatch = null;
    }
    updateKeyLabels();
  });

  accentKeyRefs.push({ button, value });
  return button;
}

function handleCharacterInput(rawValue) {
  const shift = isShiftActive();
  const alt = isAltActive();
  const transliterated = transliterate(rawValue, {
    useAlt: alt,
    shift
  });

  insertText(transliterated);

  const activeAccentKey = getActiveAccentKey();
  if (activeAccentKey) {
    const applied = applyAccent(activeAccentKey);
    if (applied && accentLatch === activeAccentKey) {
      accentLatch = null;
    }
  }

  if (shiftLatch) {
    shiftLatch = false;
  }
  if (altLatch) {
    altLatch = false;
  }

  updateKeyLabels();
}

function buildKeyboard() {
  document.querySelectorAll('.keyboard__row').forEach((rowElement, index) => {
    const row = rows[index];
    row.forEach((keyDef) => {
      let button;
      if (keyDef.type === 'standard') {
        button = createStandardKey(keyDef.value);
      } else if (keyDef.type === 'modifier') {
        button = createModifierKey(keyDef.action, keyDef.label, keyDef.classes);
      } else if (keyDef.type === 'accent') {
        button = createAccentKey(keyDef.value, keyDef.label, keyDef.secondary);
      } else if (keyDef.type === 'action') {
        button = createActionKey(keyDef.action, keyDef.label, keyDef.classes);
      }

      if (button) {
        rowElement.appendChild(button);
      }
    });
  });

  updateKeyLabels();
}

function resolveInputCharacter(event) {
  if (event.code) {
    if (codeToCharacterMap.hasOwnProperty(event.code)) {
      return codeToCharacterMap[event.code];
    }

    if (event.code.startsWith('Key')) {
      return event.code.slice(3).toLowerCase();
    }
  }

  if (event.key === 'Dead') {
    if (event.code && event.code.startsWith('Key')) {
      return event.code.slice(3).toLowerCase();
    }
    return null;
  }

  const char = event.key.toLowerCase();
  if (baseMapping.hasOwnProperty(char) || altMapping.hasOwnProperty(char)) {
    return char;
  }

  return null;
}

function handlePhysicalKeydown(event) {
  if (event.ctrlKey || event.metaKey) {
    return;
  }

  if (deadKeyToAccentKey.hasOwnProperty(event.key)) {
    accentHeld = deadKeyToAccentKey[event.key];
    updateKeyLabels();
    requestSuppressNativeInsert();
    event.preventDefault();
    return;
  }

  if (digitToAccentKey.hasOwnProperty(event.code)) {
    accentHeld = digitToAccentKey[event.code];
    updateKeyLabels();
    requestSuppressNativeInsert();
    event.preventDefault();
    return;
  }

  if (event.key === 'Shift') {
    shiftHeld = true;
    updateKeyLabels();
    return;
  }

  if (event.key === 'Alt') {
    altHeld = true;
    updateKeyLabels();
    event.preventDefault();
    return;
  }

  if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === 'Tab') {
    return;
  }

  if (event.key === ' ') {
    requestSuppressNativeInsert();
    event.preventDefault();
    insertText(' ');
    return;
  }

  if (event.key.length === 1 || event.key === 'Dead') {
    const lower = resolveInputCharacter(event);
    const accentActive = Boolean(getActiveAccentKey());
    const altActive = isAltActive() || event.altKey;

    if (!lower) {
      if (accentActive || altActive || event.key === 'Dead') {
        requestSuppressNativeInsert();
        event.preventDefault();
      }
      return;
    }

    requestSuppressNativeInsert();
    event.preventDefault();
    const shift = isShiftActive() || event.shiftKey;
    const useAlt = altActive;
    const transliterated = transliterate(lower, { useAlt, shift });
    insertText(transliterated);

    const activeAccentKey = getActiveAccentKey();
    if (activeAccentKey) {
      const applied = applyAccent(activeAccentKey);
      if (applied && accentLatch === activeAccentKey && !event.repeat) {
        accentLatch = null;
      }
    }

    if (shiftLatch) {
      shiftLatch = false;
    }
    if (altLatch) {
      altLatch = false;
    }

    updateKeyLabels();
  }
}

function handlePhysicalKeyup(event) {
  if (digitToAccentKey.hasOwnProperty(event.code)) {
    if (accentHeld === digitToAccentKey[event.code]) {
      accentHeld = null;
      updateKeyLabels();
    }
    event.preventDefault();
    return;
  }

  if (deadKeyToAccentKey.hasOwnProperty(event.key)) {
    if (accentHeld === deadKeyToAccentKey[event.key]) {
      accentHeld = null;
      updateKeyLabels();
    }
    event.preventDefault();
    return;
  }

  if (event.key === 'Shift') {
    shiftHeld = false;
    updateKeyLabels();
  } else if (event.key === 'Alt') {
    altHeld = false;
    updateKeyLabels();
  }
}

function setupClipboard() {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1600);
    } catch (error) {
      copyBtn.textContent = 'Press Ctrl+C';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1600);
    }
  });
}

function setupClear() {
  clearBtn.addEventListener('click', () => {
    output.value = '';
    output.focus();
  });
}

function setupInputGuards() {
  output.addEventListener('beforeinput', (event) => {
    if (!suppressNativeInsert) {
      return;
    }

    const type = event.inputType;
    if (type === 'insertText' || type === 'insertCompositionText') {
      event.preventDefault();
    }
  });

  output.addEventListener('textInput', (event) => {
    if (suppressNativeInsert) {
      event.preventDefault();
    }
  });
}

function init() {
  // Expand accentable list with uppercase versions and alternative vowels.
  const extras = Array.from(accentableCharacters);
  extras.forEach((char) => {
    accentableCharacters.add(char.toUpperCase());
  });

  // Include alternative mappings in the accentable set.
  Object.values(altMapping).forEach((char) => {
    const base = char[0];
    if (accentableCharacters.has(base)) {
      accentableCharacters.add(char);
      accentableCharacters.add(char.toUpperCase());
    }
  });

  buildKeyboard();
  setupClipboard();
  setupClear();
  setupInputGuards();
  output.focus();

  output.addEventListener('keydown', handlePhysicalKeydown);
  output.addEventListener('keyup', handlePhysicalKeyup);
}

init();
