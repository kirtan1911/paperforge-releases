# 04 · Release Pipeline (GitHub Actions)

Private repo ma tag push karo → .exe + signed .apk automatic bane → **public `paperforge-releases` repo** ma Release bane.

## 0. Public releases repo banavo
1. GitHub par navi **public** repo: `paperforge-releases` (README sathe; source code nahi).
2. README ma: app shu chhe, website link, install notes (SmartScreen, Unknown apps).
3. Fine-grained token banavo: *Settings → Developer settings → Personal access tokens → Fine-grained*. Repository access: **sirf `paperforge-releases`**, permission **Contents: Read and write**.
4. Private (source) repo ma secret add karo: `RELEASES_REPO_TOKEN` = aa token.

> Private repo no default `GITHUB_TOKEN` bija repo ma Release banavi nathi shakto, etle aa token jaruri chhe. Token expire thay tyare renew karo.

## One-time setup

### 1. Fixed file names
`electron-builder.yml`:
```yaml
nsis:
  artifactName: PaperForge-Setup.${ext}
```
APK workflow ma `paperforge.apk` rename thase.

### 2. Android signing (release APK)
```bash
keytool -genkey -v -keystore paperforge.jks -keyalg RSA -keysize 2048 -validity 10000 -alias paperforge
base64 -w0 paperforge.jks > keystore.b64      # Mac: base64 -i paperforge.jks
```
GitHub repo → *Settings → Secrets and variables → Actions* ma add:
| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_B64` | `keystore.b64` no content |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | `paperforge` |
| `ANDROID_KEY_PASSWORD` | key password |
| `RELEASES_REPO_TOKEN` | public releases repo no fine-grained token |

**`paperforge.jks` ni 2 backup copy alag jagya e rakho. Gum thayu to update nahi aavshe.** Keystore repo ma commit **nahi** karvu.

### 3. Gradle signing config
`android/app/build.gradle` ma `android { ... }` andar:
```groovy
signingConfigs {
    release {
        storeFile file(System.getenv("KEYSTORE_PATH") ?: "../paperforge.jks")
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
    }
}
```
(`android/` Capacitor generate kare chhe — jo git ma commit karo to aa change save rahe.)

## `.github/workflows/release.yml`
```yaml
name: Release
on:
  push:
    tags: ['v*']

permissions:
  contents: read

jobs:
  windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - run: npx electron-builder --win --publish never
      - uses: actions/upload-artifact@v4
        with:
          name: exe
          path: release/PaperForge-Setup.exe

  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 17 }
      - run: npm ci
      - run: npm run build
      - run: npx cap sync android
      - name: Decode keystore
        run: echo "${{ secrets.ANDROID_KEYSTORE_B64 }}" | base64 -d > android/paperforge.jks
      - name: Build release APK
        working-directory: android
        env:
          KEYSTORE_PATH: ../paperforge.jks
          KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
        run: ./gradlew assembleRelease
      - name: Rename
        run: cp android/app/build/outputs/apk/release/app-release.apk paperforge.apk
      - uses: actions/upload-artifact@v4
        with:
          name: apk
          path: paperforge.apk

  publish:
    needs: [windows, android]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { path: dist-files, merge-multiple: true }
      - uses: softprops/action-gh-release@v2
        with:
          files: |
            dist-files/PaperForge-Setup.exe
            dist-files/paperforge.apk
          repository: kirtan1911/paperforge-releases
          token: ${{ secrets.RELEASES_REPO_TOKEN }}
          tag_name: ${{ github.ref_name }}
          name: PaperForge ${{ github.ref_name }}
          generate_release_notes: false
          body: |
            PaperForge ${{ github.ref_name }}
            - Windows: PaperForge-Setup.exe (SmartScreen: More info → Run anyway)
            - Android: paperforge.apk (allow Install unknown apps)
```

## Private repo ma Actions minutes
Free plan ma private repo mate monthly minutes cap chhe, ane Windows runner vadhare minutes gane. Dar commit par nahi, **sirf tag (release) par** chalavo (upar na workflow ma tem j chhe).

## Release karva mate
```bash
npm version 1.2.0 --no-git-tag-version   # package.json version
git commit -am "release 1.2.0"
git tag v1.2.0
git push && git push --tags
```
~10–15 min ma `paperforge-releases` na Release page par banne files aavi jashe. Link `releases/latest/download/...` auto navi file par point kare.

## Pehli vaar manual test
Workflow chalavta pehla local par `assembleDebug` ane `electron-builder --win` chalavi juo (doc `05`/`06` original). Pachi j CI.

## Tips
- Prerelease mate `v1.2.0-beta.1` tag — GitHub "latest" ma na gane (Release ma *prerelease* tick karo).
- APK `versionCode` har release par vadharo (`android/app/build.gradle`), nahi to install-over-update fail thay.
- Tag ane `package.json` version match rakho.
