# MyNotes (Android, React Native + Expo)

A simple notes app with tabs, editable titles, theme toggle, copy single/all, delete, and persistence. Built with SOLID-oriented architecture and React Native best practices.

## Features
- Create, select, rename, edit and delete notes
- Debounced saving for titles and content
- Light/Dark theme toggle (persisted)
- Copy single note or all notes to clipboard
- Clear all notes with confirmation
- Local persistence via AsyncStorage

## Folder
All app files are inside the `android` folder to keep this mobile app isolated in your repo.

## Run with Expo
1. Install dependencies
   ```bash
   cd android
   npm install
   # or: yarn
   ```
2. Start the Expo dev server
   ```bash
   npm run start
   ```
3. Open on Android (device/emulator)
   - Use the Expo Go app and scan the QR code, or
   - Press `a` in the terminal to launch an Android emulator.

> Requires Node.js LTS and the Expo CLI (installed automatically by `expo` package).

## Tech
- Expo SDK 52
- React Native
- AsyncStorage (`@react-native-async-storage/async-storage`)
- Clipboard (`expo-clipboard`)

## Architecture (SOLID)
- Single Responsibility: Each service and component has one concern.
- Open/Closed: Core services expose stable contracts; behavior can be extended without modifying consumers.
- Liskov Substitution: Interfaces can be swapped (e.g., storage, clipboard) without breaking consumers.
- Interface Segregation: UI components receive minimal, specific props.
- Dependency Inversion: React components depend on abstractions (services), not concrete implementations.

## Notes
- Data shape:
  ```json
  {
    "notes": [{ "id": "string", "title": "string", "content": "string", "updatedAt": 0 }],
    "selectedId": "string|null",
    "theme": "dark|light",
    "lastWriteBy": "string"
  }
  ```
