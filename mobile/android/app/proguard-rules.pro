# Flutter & Plugins Proguard Rules
-keep class io.flutter.plugins.sharedpreferences.** { *; }
-dontwarn io.flutter.plugins.sharedpreferences.**
-keep class io.flutter.plugins.pathprovider.** { *; }
-dontwarn io.flutter.plugins.pathprovider.**
-keep class io.flutter.embedding.** { *; }
-dontwarn io.flutter.embedding.**

# Play Core deferred components warnings (not using Play Store deferred dynamic delivery)
-dontwarn com.google.android.play.core.**
