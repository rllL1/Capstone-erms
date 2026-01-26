# Flutter Mobile App Setup Guide

## Complete Setup Instructions

### Step 1: Install Flutter

1. Download Flutter SDK from [flutter.dev](https://flutter.dev)
2. Extract to a location (e.g., `C:\flutter`)
3. Add Flutter to your PATH:
   - Windows: Add `C:\flutter\bin` to System Environment Variables
   - Verify: Run `flutter doctor` in terminal

### Step 2: Configure Supabase

1. Get your Supabase credentials:
   - Open Supabase Dashboard
   - Go to Project Settings > API
   - Copy the **URL** and **anon/public** key

2. Update [lib/main.dart](lib/main.dart):
   ```dart
   await Supabase.initialize(
     url: 'https://your-project.supabase.co',
     anonKey: 'your-anon-key-here',
   );
   ```

### Step 3: Update Database

Run the migration file in Supabase:

1. Go to Supabase Dashboard > SQL Editor
2. Copy the content from `../supabase/student-schema.sql`
3. Run the SQL script
4. This will add required columns: `student_id`, `firstname`, `middlename`, `lastname`, `course`, `status`

### Step 4: Run the App

```bash
# Navigate to the app folder
cd student-mobile-app

# Get dependencies
flutter pub get

# Run on Android emulator/device
flutter run

# Or run on iOS (Mac only)
flutter run -d ios
```

### Step 5: Test the Flow

1. **Signup**:
   - Open the app
   - Click "Sign Up"
   - Fill in all fields
   - Submit registration
   - Account status will be "pending"

2. **Admin Approval** (Web):
   - Log into admin web portal
   - Go to Students menu
   - Find pending student
   - Click "Approve"

3. **Login**:
   - Return to mobile app
   - Enter Student ID and Password
   - Access granted!

## Common Issues

### Flutter Doctor Errors

Run `flutter doctor` and follow the instructions to install missing components:
- Android Studio
- Android SDK
- VS Code extensions (optional)

### Supabase Connection Error

Check:
- Internet connection
- Supabase URL and key are correct
- Supabase project is active

### Build Errors

```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

## Project Commands

```bash
# Install dependencies
flutter pub get

# Run app
flutter run

# Build APK (Android)
flutter build apk

# Build for release
flutter build apk --release

# Check for issues
flutter doctor
```

## Android Setup

If you need to build for Android:

1. Install [Android Studio](https://developer.android.com/studio)
2. Install Android SDK
3. Create an Android emulator or connect a device
4. Run `flutter doctor --android-licenses` and accept all

## iOS Setup (Mac only)

1. Install [Xcode](https://developer.apple.com/xcode/)
2. Install CocoaPods: `sudo gem install cocoapods`
3. Open iOS Simulator
4. Run `flutter run -d ios`

## Deployment

### Android (APK)

```bash
flutter build apk --release
```

APK location: `build/app/outputs/flutter-apk/app-release.apk`

### Android (App Bundle for Play Store)

```bash
flutter build appbundle --release
```

Bundle location: `build/app/outputs/bundle/release/app-release.aab`

## Development Tips

- Use hot reload: Press `r` in terminal while app is running
- Hot restart: Press `R` in terminal
- Use Android Studio or VS Code for better development experience
- Install Flutter and Dart extensions in your IDE

## Support

For help:
1. Check Flutter documentation: https://docs.flutter.dev
2. Supabase Flutter docs: https://supabase.com/docs/reference/dart
3. Contact your system administrator
