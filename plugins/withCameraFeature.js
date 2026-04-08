// Config plugin — injects <uses-feature android:name="android.hardware.camera"
// android:required="false"> into the generated AndroidManifest.xml.
//
// WHY: android.permissions: ["CAMERA"] in app.json generates the
// <uses-permission> tag, but Android Lint rule
// PermissionImpliesUnsupportedChromeOsHardware requires a matching
// <uses-feature required="false"> tag so the app isn't hidden from
// Chrome OS and other devices that lack a physical camera.
//
// required="false" means "camera is optional — the app can still install
// and run on devices without one", which is correct for ChatFlow Pro
// (camera is used only for photo search, not core functionality).

const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = (config) =>
  withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;

    if (!manifest['uses-feature']) {
      manifest['uses-feature'] = [];
    }

    // Guard against duplicate entries if prebuild runs more than once
    const alreadyPresent = manifest['uses-feature'].some(
      (f) => f.$?.['android:name'] === 'android.hardware.camera'
    );

    if (!alreadyPresent) {
      manifest['uses-feature'].push({
        $: {
          'android:name': 'android.hardware.camera',
          'android:required': 'false',
        },
      });
    }

    return mod;
  });
