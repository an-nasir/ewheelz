# GooseHint: Add Urdu Localization (P1)

## Objective
Add Urdu language support to eWheelz using next-i18next.

## Tasks
1. **Setup i18n**:
   - Install `next-i18next`:
     ```bash
     npm install next-i18next
     ```
   - Configure in `next-i18next.config.js`:
     ```js
     module.exports = {
       i18n: {
         defaultLocale: "en",
         locales: ["en", "ur"],
       },
     };
     ```

2. **Translation Files**:
   - Create `public/locales/ur/common.json`:
     ```json
     {
       "welcome": "خوش آمدید",
       "evDatabase": "الیکٹرک گاڑیوں کا ڈیٹا بیس",
       "chargingStations": "چارجر اسٹیشنز",
       "tripPlanner": "سفر کی منصوبہ بندی",
       "range": "دائرہ",
       "battery": "بیٹری",
       "compare": "مقابلہ کریں",
       "save": "محفوظ کریں",
       "signIn": "لاگ ان کریں",
       "signOut": "لاگ آؤٹ کریں"
     }
     ```

3. **UI Integration**:
   - Wrap the app with `appWithTranslation` in `src/app/layout.tsx`:
     ```tsx
     import { appWithTranslation } from "next-i18next";

     function RootLayout({ children }) {
       return (
         <html lang="en" dir="ltr">
           <body>{children}</body>
         </html>
       );
     }

     export default appWithTranslation(RootLayout);
     ```
   - Add a language switcher to `src/components/NavBar.tsx`:
     ```tsx
     import { useRouter } from "next/router";

     export default function LanguageSwitcher() {
       const router = useRouter();
       const changeLanguage = (lng) => {
         router.push(router.pathname, router.asPath, { locale: lng });
       };
       return (
         <div>
           <button onClick={() => changeLanguage("en")}>English</button>
           <button onClick={() => changeLanguage("ur")}>اردو</button>
         </div>
       );
     }
     ```

4. **RTL Support**:
   - Add RTL CSS for Urdu:
     ```css
     [dir="rtl"] {
       direction: rtl;
       text-align: right;
     }
     ```

## Expected Output
- A PR with Urdu localization setup.
- Screenshots of the UI in Urdu (RTL layout).
- List of translated strings.

## Notes
- Test RTL layout on all pages.
- Use native speakers to validate translations.
