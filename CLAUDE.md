# AR Education Toy - Project Context for Claude

> Този файл се чете автоматично от Claude Code при всяка сесия.
> Последна актуализация: 2025-12-08

## 🎯 Какво е това?

**AR Образователна Играчка** - Web-based Augmented Reality приложение за образователни плюшени играчки. Децата насочват камерата към маркер (Hiro) и виждат 3D пеперуди с отговори, които могат да докоснат.

**Demo URL**: https://sprite931.github.io/ar-education-toy/

---

## 📁 Структура на проекта

```
ar-education-toy/
├── index.html              # Главно AR приложение (A-Frame + AR.js)
├── admin.html              # Firebase админ панел за въпроси/модели/звуци
├── marker.html             # Показва Hiro маркер на екрана
├── ar-markers-print.html   # Маркери за печат
├── README.md               # Публична документация
├── CLAUDE.md               # Този файл - context за Claude
└── assets/
    └── models/
        ├── Butterfly.glb   # Default 3D модел (26KB)
        └── README.md       # Насоки за модели
```

---

## 🔥 Firebase Configuration

**Project ID**: `ar-bear-education`

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDQxYVcVSlxUZ6d4t87IppRRpD7r4R7DDk",
    authDomain: "ar-bear-education.firebaseapp.com",
    projectId: "ar-bear-education",
    storageBucket: "ar-bear-education.firebasestorage.app",
    messagingSenderId: "866761773486",
    appId: "1:866761773486:web:5dafa80d01a6b94372b83f",
    measurementId: "G-1ELMXFB3YN"
};
```

**Firebase Console**: https://console.firebase.google.com/project/ar-bear-education

### Firestore колекции

| Колекция | Описание |
|----------|----------|
| `questions` | Въпроси с категория, текст, отговори, позиции, модели |
| `models` | 3D модели (.glb) - name, url, fileName |
| `sounds` | Звуци (.mp3/.wav) - name, url, fileName |
| `settings` | Глобални настройки (correctSoundUrl, wrongSoundUrl) |

### Структура на въпрос (Firestore)

```javascript
{
  category: "math" | "alphabet" | "quiz",
  text: "2 + 3 = ?",
  correct: 0,  // Индекс на верния отговор (0-2)
  soundId: "optional_sound_id",
  soundUrl: "https://...",
  answers: [
    {
      text: "5",
      modelId: "model_id",
      modelUrl: "https://...",
      scale: 0.02,
      posX: -0.6, posY: 0.3, posZ: 0,
      rotation: 0,
      speed: 2000,
      moveRange: 0.15
    },
    // ... още 2 отговора
  ],
  createdAt: Timestamp
}
```

### Firebase Storage структура

```
gs://ar-bear-education.firebasestorage.app/
├── models/           # .glb файлове (max 5MB)
└── sounds/           # .mp3/.wav/.ogg файлове (max 2MB)
```

---

## 🎮 Игрови режими

1. **🔢 Математика** - Събиране и изваждане
2. **🔤 Азбука** - Българска азбука
3. **❓ Викторина** - Да/Не въпроси (само 2 отговора)

---

## 🛠️ Технологии

- **A-Frame 1.4.2** - 3D/VR framework
- **AR.js** - Augmented Reality (marker-based)
- **Troika-text** - 3D text с outline
- **Firebase SDK 10.7.1** - Firestore + Storage
- **Vanilla JavaScript** - Без build tools

---

## 📐 Важни константи

```javascript
// Default позиции на отговорите
Answer 0: { x: -0.6, y: 0.3, z: 0 }    // Ляво
Answer 1: { x: 0,    y: 0.35, z: 0.3 } // Център
Answer 2: { x: 0.6,  y: 0.3, z: 0 }    // Дясно

// Scale на модели
DEFAULT_SCALE = 0.02

// Threshold за докосване
TOUCH_THRESHOLD = 80px

// Timing
CORRECT_DELAY = 1500ms
WRONG_DELAY = 1000ms
```

---

## 🚀 Планирани функционалности (Roadmap)

- [ ] Звукови ефекти с български глас
- [ ] Laravel backend API
- [ ] Subscription система (Free/Premium)
- [ ] Multi-marker support за аксесоари
- [ ] Parent dashboard с analytics
- [ ] Progress tracking

---

## 💰 Бизнес модел

| Tier | Цена | Функции |
|------|------|---------|
| Free | €0 | 1 маркер, Математика (10 въпроса) |
| Premium | €4.99/месец | Всички режими, 100+ въпроса, БГ глас |
| Premium+ | €9.99/месец | + Нови маркери, Parent dashboard |

---

## 📝 Правила за разработка

### При промени в кода:
1. Тествай локално с `python -m http.server 8000`
2. Провери дали Firebase работи (отвори admin.html)
3. Commit с ясно съобщение на български или английски
4. Push към GitHub

### При добавяне на нови функции:
1. Обнови този файл (CLAUDE.md) с новата информация
2. Ако е нещо публично - обнови и README.md
3. Документирай Firebase промени (нови колекции/полета)

### Стил на кода:
- Коментари на български където е нужно
- Използвай vanilla JS (без frameworks)
- Пази файловете компактни (inline styles са ОК)

---

## 🔗 Важни линкове

- **GitHub Repo**: https://github.com/sprite931/ar-education-toy
- **Live Demo**: https://sprite931.github.io/ar-education-toy/
- **Admin Panel**: https://sprite931.github.io/ar-education-toy/admin.html
- **Firebase Console**: https://console.firebase.google.com/project/ar-bear-education

---

## 📅 История на промените

| Дата | Промяна |
|------|---------|
| 2025-12-08 | Преместване от Netlify към GitHub Pages |
| 2025-12-08 | Създаден CLAUDE.md с пълна документация |
| 2025-12-08 | Firebase интеграция с admin panel |
| 2025-12-08 | Добавени customization controls и feedback sounds |

---

## ⚠️ Бележки

- Сесиите на Claude Code са **локални** и не се синхронизират между компютри
- Винаги commit-вай и push-вай промените за да са достъпни навсякъде
- При смяна на компютър - clone repo-то и продължи от там
- API ключовете са публични (Firebase client SDK) - това е нормално за web apps
