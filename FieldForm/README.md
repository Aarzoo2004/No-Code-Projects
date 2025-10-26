# README.md

```markdown
# FieldForm AI

> No-Code AI-Powered Field Form Generator

Transform natural language descriptions into fully functional web forms with validation and automation rules. Built for field teams who need rapid form creation without coding.

## ✨ What It Does

- **Describe → Generate**: Turn plain English into working forms
- **AI-Powered**: Uses OpenAI to understand your form requirements  
- **Smart Validation**: Automatic client & server-side validation
- **Conditional Notifications**: Get alerts based on form data
- **Demo Ready**: Pre-built examples and test cases

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### 1. Clone & Setup

```bash
# Create project directory
mkdir fieldform-ai
cd fieldform-ai

# Create backend and frontend folders
mkdir backend frontend
```

### 2. Backend Setup

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

### 3. Frontend Setup

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

# Start frontend
npm run dev
```

### 4. Configure OpenAI (Optional)

1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Update `backend/.env` with your actual key
3. **No key?** The app uses mock data for demo

## 🎯 Usage

1. **Start both servers**:
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`

2. **Generate a form**:
   - Type: "Create electrical pole inspection form with voltage field (0-1000V)"
   - Click "Generate Form with AI"

3. **Test the form**:
   - Fill out generated fields
   - Submit to see validation and notifications

## 📁 Project Structure

```
fieldform-ai/
├── backend/
│   ├── src/
│   │   ├── utils/       # AI & validation
│   │   └── storage/     # Data handling
│   └── server.js        # Main server
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   └── utils/       # API calls
    └── vite.config.js
```

## 🛠 Tech Stack

- **Backend**: Node.js, Express, OpenAI API
- **Frontend**: React, Vite, Tailwind CSS
- **Storage**: JSON files (file-based)

## 🔧 Scripts

**Backend**:
- `npm run dev` - Start development server
- `npm test` - Run tests

**Frontend**:
- `npm run dev` - Start development server  
- `npm run build` - Build for production

## 💡 Example Prompts

- "Create safety inspection form with hazard detection"
- "Build equipment maintenance form with technician details"  
- "Generate site survey form with photos and measurements"

## 🆘 Need Help?

- **Backend not starting**: Check port 5000 availability
- **AI errors**: Verify API key or use mock data
- **Styling issues**: Confirm Tailwind configuration, Tailwind v4 has different configuration than v3

---

**Built for modern field teams | No-code form generation powered by AI**
```

# Backend .gitignore

**Create `backend/.gitignore`:**
```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs
*.log

# Runtime data
data/
*.json

# Coverage
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build outputs
dist/
build/
```

# Frontend .gitignore

**Create `frontend/.gitignore`:**
```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
dist-ssr/

# Cache
.vite/
.parcel-cache

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

# Root .gitignore (Optional)

**Create `.gitignore` in project root:**
```
# Backend
backend/node_modules/
backend/data/
backend/.env

# Frontend  
frontend/node_modules/
frontend/dist/
frontend/.env

# IDE
.vscode/
.idea/

# OS
.DS_Store
```