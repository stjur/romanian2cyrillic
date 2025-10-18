# Romanian to Old Romanian Cyrillic Keyboard

This project provides a standalone, browser-based virtual keyboard that transliterates modern Romanian characters to Old Romanian Cyrillic glyphs in real time. It mirrors the behaviour of tools such as the Lexilogos keyboard and can be embedded in other pages (for example, WordPress) by including the HTML, CSS, and JavaScript files.

## Features

- Real-time transliteration while typing on a physical keyboard or clicking the on-screen keys.
- Support for Romanian diacritics (ă, â, î, ș, ț) and their corresponding Old Romanian Cyrillic characters.
- Alternative character selection via an Alt modifier (e.g., `t → ѳ`, `u → ю`).
- Acute (´) and grave (`) accent modifiers that apply combining marks to the supported vowels. Activate them via the on-screen keys or by holding the physical **3** (acute) or **4** (grave) keys.
- Shift modifier for uppercase output.
- Copy and Clear helpers for managing the generated text.

## Usage

Open `index.html` in a modern browser. To embed the keyboard inside another site, copy `index.html`, `styles.css`, and `script.js` into your project, adjust the surrounding markup as needed, and ensure the CSS and JS files are linked.

## Development

No build step is required. All logic lives in `script.js`, styles are in `styles.css`, and the markup is in `index.html`.
