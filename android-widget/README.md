# Zenith Android Home-Screen Widget

A small native Android companion for the existing Zenith Next.js + FastAPI + PostgreSQL application.

## What it provides

- Android home-screen widget showing open tasks and their due dates.
- Manual refresh action.
- Quick note form that creates notes through the existing authenticated API.
- Existing Zenith account sign-in.
- Access token stored with Android EncryptedSharedPreferences.
- No second database; the FastAPI API remains the source of truth.

## Requirements

- Android Studio with Android SDK 35 installed.
- JDK 17.
- Internet access on the Android device.

## Open and run

1. Open the `android-widget` directory in Android Studio.
2. Let Gradle sync.
3. Select an Android device or emulator and run the `app` configuration.
4. Open **Zenith Widgets**, sign in with your existing Zenith account, and return to the launcher.
5. Long-press the Android home screen, open **Widgets**, find **Zenith Tasks**, and add it.
6. Use **Refresh** to reload tasks or **+ Quick note** to create a note.

The app currently uses the production API URL from `app/build.gradle.kts`:

```text
https://zenith-j1gr.onrender.com
```

Change `ZENITH_API_BASE_URL` in that file if your backend URL changes. For a local development backend, the Android emulator uses `10.0.2.2` to reach the host computer; a physical phone needs the computer's LAN IP and the backend must be reachable on the network.

## Session behavior

Zenith's current login endpoint returns a JWT with a finite lifetime and no refresh-token endpoint. When the token expires, the widget asks the user to sign in again. Do not extend token lifetime or bypass authentication solely for widgets.

## Notes

- The widget refreshes when added, when the user taps Refresh, and at Android's widget update interval (subject to OS scheduling).
- Android controls periodic widget refresh timing; it is not guaranteed to run at an exact time.
- Widget content is visible on the device home screen. Avoid adding sensitive note contents to the widget. This first version only shows task titles and due dates.
- This module is a starter implementation and should be built and tested on an Android device before release.
