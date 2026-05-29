# Push-сповіщення через Firebase — покрокова інструкція

Мета: адмін пише новину в консолі Firebase → у всіх, хто увімкнув
сповіщення, спливає push (навіть із закритим застосунком на Android).

---

## Частина 1. Створення проєкту Firebase (одноразово)

1. Відкрийте **https://console.firebase.google.com** і увійдіть у Google-акаунт.
2. Натисніть **Add project / Створити проєкт**. Назвіть, наприклад, `integrity-police`.
   Google Analytics можна вимкнути — для push не потрібен.
3. Коли проєкт створено, на головній натисніть іконку **Web `</>`**
   («Add app» → Web), щоб зареєструвати вебзастосунок.
4. Дайте назву (`integrity-pwa`), **Register app**.
5. Firebase покаже об'єкт `firebaseConfig` — **скопіюйте його**. Виглядає так:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "integrity-police.firebaseapp.com",
     projectId: "integrity-police",
     storageBucket: "integrity-police.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abc123"
   };
   ```

## Частина 2. Отримання VAPID-ключа

1. У консолі: **⚙ Project settings → вкладка Cloud Messaging**.
2. Розділ **Web configuration → Web Push certificates**.
3. Натисніть **Generate key pair**.
4. З'явиться довгий рядок (починається з `B...`) — це ваш **публічний VAPID-ключ**.

## Частина 3. Вставлення ключів у файли

Треба замінити заглушки `ЗАМІНІТЬ_...` у **двох** файлах **однаковими** значеннями:

### Файл `index.html`
Знайдіть блок `const firebaseConfig = {...}` та рядок `const VAPID_KEY = ...`
наприкінці файлу. Підставте свої значення з Частини 1 і VAPID з Частини 2.

### Файл `firebase-messaging-sw.js`
Знайдіть `firebase.initializeApp({...})` і підставте **той самий** `firebaseConfig`.
(VAPID сюди НЕ потрібен — лише config.)

> Уважно: `messagingSenderId` та `appId` мають збігатися в обох файлах.

## Частина 4. Публікація

Завантажте оновлені файли на GitHub Pages (як раніше). Переконайтесь, що
`firebase-messaging-sw.js` лежить **у корені** поряд з `index.html` —
FCM шукає його саме там.

## Частина 5. Підписка користувача

1. Відкрийте застосунок на телефоні (бажано вже встановлений на екран).
2. Натисніть **🔔 Увімкнути сповіщення** → дозвольте.
3. Готово — пристрій підписано.

> **iPhone:** push працює ЛИШЕ якщо застосунок додано на головний екран
> через Safari (Поділитися → На початковий екран). Просто у Safari — не спрацює.

---

## Як надіслати новину (щоденне використання)

1. Firebase Console → ліве меню **Run → Messaging** (або «Cloud Messaging»).
2. **Create your first campaign → Firebase Notification messages**.
3. Введіть **заголовок** і **текст** новини.
4. **Send test message** — щоб перевірити на одному пристрої (вставте FCM-токен
   із консолі браузера, рядок «FCM token:»).
5. Для розсилки всім: **Next → Target → ваш застосунок → Review → Publish**.

Усе. Підписані пристрої отримають push.

---

## Часті проблеми

| Симптом | Причина / рішення |
|---------|-------------------|
| Кнопка нічого не робить | Не заповнено `firebaseConfig` — перевірте обидва файли |
| `messaging/failed-service-worker` | `firebase-messaging-sw.js` не в корені або інша назва |
| Немає push на iPhone | Застосунок не доданий на головний екран через Safari |
| Push лише коли вкладка відкрита | Перевірте, що SW зареєструвався (DevTools → Application → Service Workers) |
| Токен не з'являється | Сайт має бути на HTTPS (GitHub Pages — так; `file://` не працює) |

## Безпека даних

Через Firebase зберігаються лише анонімні токени пристроїв (адреси доставки
push), без ПІБ чи службової інформації. Не надсилайте у тексті push
конфіденційних даних — лише загальні новини й посилання на сайт.
