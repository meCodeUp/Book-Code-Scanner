# Bücher-Code-Scanner 📚

Ein moderner, mobiler Web-Scanner für deine private Bibliothek. Scanne Buch-Barcodes (EAN-13), rufe automatisch Details über die Google Books API ab und speichere sie in deiner lokalen Liste.

## 🚀 Features

- **📸 Barcode Scanner**: Integrierter Kamera-Scanner (basiert auf `html5-qrcode`).
- **🔍 Automatische Infos**: Ruft Titel, Autor, Jahr und Cover-Bild von Google Books ab.
- **📝 Notizen**: Füge eigene Bemerkungen oder Zustandsbeschreibungen hinzu.
- **💾 Lokal gespeichert**: Deine Daten bleiben in deinem Browser (`localStorage`).
- **📤 CSV Export**: Exportiere deine Bibliothek als Tabelle. Auf Mobile-Geräten öffnet sich direkt der "Teilen"-Dialog.
- **🎨 Premium Design**: Dark Mode, Glassmorphism-Effekte und responsive Mobile-First Oberfläche.

## 🛠 Technologien

- **HTML5 & CSS3** (Vanilla, keine Frameworks)
- **JavaScript** (ES6+)
- **Bibliotheken (via CDN)**:
  - [`html5-qrcode`](https://github.com/mebjas/html5-qrcode) (Scanner)
  - [`Phosphor Icons`](https://phosphoricons.com/) (Icons)

## 📦 Installation & Nutzung

Da die App auf die Kamera zugreift, benötigt sie einen **Secure Context** (HTTPS oder localhost). Einfaches Öffnen der `index.html` per Doppelklick funktioniert meistens **nicht** (Kamera-Blockade).

### 1. Lokaler Server (Empfohlen für Mac/Linux)
Nutze Python (auf Macs vorinstalliert), um einen schnellen Server zu starten:

1. Öffne das Terminal in diesem Ordner.
2. Führe aus:
   ```bash
   python3 -m http.server
   ```
3. Öffne im Browser: `http://localhost:8000`

### 2. Auf dem Smartphone testen
Damit du dein Smartphone nutzen kannst, müssen beide Geräte (Laptop & Handy) im **gleichen WLAN** sein.

1. Finde die lokale IP-Adresse deines Macs heraus (z.B. in den WLAN-Einstellungen oder via `ipconfig getifaddr en0`).
2. Starte den Python-Server wie oben.
3. Öffne auf dem Handy: `http://<DEINE-IP-ADRESSE>:8000`
   > **Hinweis**: Manche Browser blockieren die Kamera bei "http" (unverschlüsselt) im Netzwerk. In diesem Fall ist ein USB-Debugging-Setup oder ein Deployment (siehe unten) nötig.

### 3. Deployment (Server)
Für die dauerhafte Nutzung empfiehlt sich ein Hosting bei **GitHub Pages**, **Vercel** oder **Netlify**. Einfach diese Dateien hochladen – es ist kein Build-Prozess nötig!
