# Face ID

Bare React Native app (no Expo) for a Face ID camera setup on iOS and Android.

- Package / bundle id: `com.faceidproject.app`

## Screens

1. Permissions — camera access
2. How to Set Up Face ID — what the head circle is for
3. Record — front camera and a face-angle ring

The circle records head angles with the camera. Completing the circle finishes setup. There is no system biometric prompt.

## Run

Use Node 22 or newer and JDK 17.

```sh
npm start
npm run android
npm run ios
```

iOS dependencies:

```sh
cd ios
bundle install
bundle exec pod install
```
