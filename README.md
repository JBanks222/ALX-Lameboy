# Lameboy - Retro Game Console

A retro-styled Game Boy interface with fully functional pressable buttons, ready for mini game development!

## Features

- 🎮 Classic Game Boy design with authentic styling
- 🔘 Fully interactive buttons (D-pad, J, B, Start, Select)
- ⌨️ Keyboard controls support
- 📱 Touch-friendly for mobile devices
- 🎨 Retro green screen display
- ✨ Visual feedback on button presses

## Controls

### Mouse/Touch
- Click or tap any button to interact

### Keyboard
- **Arrow Keys or WASD**: D-pad (Up, Down, Left, Right)
- **J**: J button
- **B**: B button
- **Enter**: Start button
- **Shift**: Select button

## Usage

Simply open `index.html` in your web browser to start using the Lameboy!

## For Game Development

The Lameboy exposes a simple API for game development:

```javascript
// Check if a button is currently pressed
const isJPressed = window.getButtonState('j');

// Get all button states
const allStates = window.getAllButtonStates();

// Listen for button press events
document.addEventListener('buttonPress', (e) => {
    console.log(`Button ${e.detail.button} was pressed!`);
});

// Listen for button release events
document.addEventListener('buttonRelease', (e) => {
    console.log(`Button ${e.detail.button} was released!`);
});
```

## Available Buttons

- `up`, `down`, `left`, `right` - D-pad directions
- `j`, `b` - Action buttons
- `start`, `select` - Menu buttons

## Next Steps

This is the base interface. You can now:
1. Add your mini game logic to `script.js`
2. Update the screen content in the `.game-display` div
3. Use the button events to control your game

Enjoy building your mini game! 🎮

