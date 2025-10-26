
````markdown
<h1 align="center">⚡ FieldForm AI</h1>

<p align="center">
  <em>No-Code AI-Powered Field Form Generator</em><br>
  Transform natural language descriptions into fully functional web forms with validation and automation — <strong>no coding required.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-16%2B-green?style=flat-square" />
  <img src="https://img.shields.io/badge/React-Vite-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/OpenAI-Integrated-lightgrey?style=flat-square" />
  <img src="https://img.shields.io/badge/TailwindCSS-Enabled-38BDF8?style=flat-square" />
</p>

---

## ✨ Overview

🚀 **FieldForm AI** converts **plain English** into fully functional web forms for **field teams** — complete with **validation**, **notifications**, and **smart automation**.  

### 💡 Key Features

- 🧠 **AI-Powered Understanding** — Converts descriptions into form fields  
- ⚙️ **Automatic Validation** — Client & server-side rules generated instantly  
- 🔔 **Conditional Notifications** — Trigger alerts based on form inputs  
- 🧩 **Demo Ready** — Comes with test forms and examples out of the box  

---

## ⚡ Quick Start

### 🧱 Prerequisites
- [Node.js 16+](https://nodejs.org/)
- npm or yarn

---

### 1️⃣ Clone & Setup Project

```bash
# Create project directory
mkdir fieldform-ai && cd fieldform-ai

# Create backend and frontend folders
mkdir backend frontend
````

---

### 2️⃣ Backend Setup

```bash
cd backend

# Initialize and install dependencies
npm init -y
npm install express cors dotenv openai
npm install --save-dev nodemon jest

# Create environment file
echo "OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
NODE_ENV=development" > .env

# Start backend server
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend

# Create React app with Vite
npm create vite@latest . -- --template react

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npm install react-hot-toast

# Initialize Tailwind
npx tailwindcss init -p

# Create environment file
echo "VITE_API_BASE_URL=http://localhost:5000" > .env

# Start frontend server
npm run dev
```

---

### 4️⃣ Configure OpenAI (Optional)

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to `backend/.env`
3. No API key? The app will use mock data for demo purposes

---

## 🎯 Usage Guide

1. **Start both servers**

   * Backend → [http://localhost:5000](http://localhost:5000)
   * Frontend → [http://localhost:3000](http://localhost:3000)

2. **Generate a Form**
   Type:

   ```
   Create electrical pole inspection form with voltage field (0-1000V)
   ```

   Then click **"Generate Form with AI"**

3. **Test Your Form**

   * Fill out generated fields
   * Submit to see live validation & conditional notifications

---

## 🧩 Project Structure

```
fieldform-ai/
├── backend/
│   ├── src/
│   │   ├── utils/        # AI logic & validation helpers
│   │   └── storage/      # File-based data
│   └── server.js         # Express server entry
└── frontend/
    ├── src/
    │   ├── components/   # React UI components
    │   └── utils/        # API utilities
    └── vite.config.js
```

---

## 🛠️ Tech Stack

| Layer           | Technology                                 |
| --------------- | ------------------------------------------ |
| **Frontend**    | React, Vite, Tailwind CSS, React Hot Toast |
| **Backend**     | Node.js, Express, OpenAI API               |
| **Storage**     | JSON-based local data                      |
| **Testing**     | Jest                                       |
| **Environment** | dotenv, nodemon                            |

---

## ⚙️ Scripts

### **Backend**

```bash
npm run dev   # Start development server
npm test      # Run tests
```

### **Frontend**

```bash
npm run dev   # Start development server
npm run build # Build for production
```

---

## 💬 Example Prompts

> 🧠 “Create safety inspection form with hazard detection”
> 🧰 “Build equipment maintenance form with technician details”
> 📷 “Generate site survey form with photos and measurements”

---

## 🆘 Troubleshooting

| Issue                | Solution                                        |
| -------------------- | ----------------------------------------------- |
| Backend not starting | Ensure port `5000` is available                 |
| AI errors            | Check `.env` for valid `OPENAI_API_KEY`         |
| Styling problems     | Confirm Tailwind CSS setup (v4 differs from v3) |

---

<p align="center">  
  🔧 Built for modern field teams — <strong>No-Code Form Generation, Powered by AI ⚡</strong>  
</p>

---

### 📄 License

This project is licensed under the **MIT License** — free to use and modify.

```

