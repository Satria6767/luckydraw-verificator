# 🎰 LuckyDraw Verificator System

A professional prize draw system with attendance verification built with Next.js 14, TypeScript, Tailwind CSS, and SQLite.

## ✨ Features

- 🎲 **Random Prize Drawing**: Fair and transparent random selection algorithm
- ✅ **Attendance Verification**: Remove absent winners before final confirmation
- 🎨 **Beautiful Animations**: Slot machine-style animations with Framer Motion
- 💾 **Atomic Transactions**: Database integrity with rollback support
- 📊 **Real-time Stats**: Track participants, eligible candidates, and prizes
- 🔒 **Data Persistence**: SQLite database for reliable data storage
- 🎯 **Monolithic Architecture**: Complete backend and frontend in one codebase

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Clone or extract the project**
   ```bash
   cd luckydraw-verificator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database with sample data**
   ```bash
   npm run db:migrate
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📖 How to Use

### 1. Setup Phase
- The database comes pre-loaded with 25 sample participants and 8 prizes
- All participants start as eligible (not yet winners)

### 2. Drawing Phase
1. **Select a Prize** from the dropdown (only prizes with stock > 0 are shown)
2. **Enter Number of Winners** (cannot exceed available stock)
3. Click **ROLL NOW** to start the draw
4. Watch the slot machine animation for 3 seconds

### 3. Verification Phase
1. **Tentative winners** are displayed in cards
2. **Call each name** to verify attendance
3. If someone is **absent**, click the ❌ button to remove them
4. Removed candidates will **NOT** be saved to the database

### 4. Confirmation Phase
1. Click **CONFIRM ALL WINNERS** to finalize
2. The system will:
   - Mark winners as `is_winner = true`
   - Create winner records with timestamp
   - Reduce prize quota automatically
   - Update eligibility for next draw

## 🗄️ Database Schema

### Tables

#### `participants`
```sql
CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nim TEXT NOT NULL,
  is_winner INTEGER DEFAULT 0,  -- 0 = eligible, 1 = already won
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### `prizes`
```sql
CREATE TABLE prizes (
  id TEXT PRIMARY KEY,
  prize_name TEXT NOT NULL UNIQUE,
  initial_quota INTEGER NOT NULL,
  current_quota INTEGER NOT NULL,  -- Decreases when winners confirmed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### `winners` (History Log)
```sql
CREATE TABLE winners (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL,
  prize_id TEXT NOT NULL,
  won_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participant_id) REFERENCES participants(id),
  FOREIGN KEY (prize_id) REFERENCES prizes(id)
)
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Database**: SQLite (better-sqlite3)
- **Icons**: Lucide React

## 📂 Project Structure

```
luckydraw-verificator/
├── app/
│   ├── api/
│   │   ├── participants/     # Participant endpoints
│   │   ├── prizes/           # Prize endpoints
│   │   ├── draw/             # Random draw logic
│   │   ├── confirm/          # Winner confirmation
│   │   └── winners/          # Winner history
│   ├── page.tsx              # Main draw interface
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── SlotMachine.tsx       # Animated slot machine
│   └── WinnerCard.tsx        # Winner card with remove button
├── lib/
│   └── db.ts                 # Database operations
├── scripts/
│   └── migrate.js            # Database initialization
└── luckydraw.db              # SQLite database (auto-created)
```

## 🔧 API Endpoints

### Participants
- `GET /api/participants` - Get all participants
- `GET /api/participants/eligible` - Get eligible participants (not yet winners)
- `POST /api/participants` - Add new participant

### Prizes
- `GET /api/prizes` - Get all prizes
- `GET /api/prizes/available` - Get prizes with stock > 0
- `POST /api/prizes` - Add new prize

### Draw System
- `POST /api/draw` - Draw random winners (tentative)
- `POST /api/confirm` - Confirm winners (atomic transaction)

### Winners
- `GET /api/winners` - Get winner history

## 🎯 Key Features Explained

### Random Selection Algorithm
Uses Fisher-Yates shuffle for unbiased random selection:
```typescript
const shuffled = [...eligibleParticipants];
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}
```

### Atomic Transaction
The confirmation process uses SQLite transactions to ensure data integrity:
```typescript
const transaction = db.transaction(() => {
  // Mark participants as winners
  // Create winner records
  // Reduce prize quota
  // All or nothing - automatic rollback on error
});
```

### Animation System
Framer Motion provides smooth animations:
- Slot machine: 3-second easing animation
- Card entrance: Staggered animation with 0.1s delay
- Remove animation: Scale and fade out

## 🎨 Customization

### Add More Participants
```bash
# Edit scripts/migrate.js and add to the participants array
{ name: 'Your Name', nim: '123456' }
```

### Add More Prizes
```bash
# Edit scripts/migrate.js and add to the prizes array
{ name: 'Prize Name', quota: 5 }
```

### Reset Database
```bash
# Delete the database file and run migration again
rm luckydraw.db
npm run db:migrate
```

## 🐛 Troubleshooting

### "No prizes available"
- Run `npm run db:migrate` to initialize the database
- Check if prizes have `current_quota > 0`

### "Not enough eligible participants"
- Some participants may already be winners
- Check database: `SELECT * FROM participants WHERE is_winner = 0`

### Database locked error
- Make sure only one instance of the app is running
- Restart the development server

## 📝 License

MIT License - Feel free to use this for your events!

## 🙏 Credits

Built with ❤️ using modern web technologies.

---

**Made for professional prize draw events with attendance verification!**
