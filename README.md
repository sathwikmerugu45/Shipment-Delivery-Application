# Shipment Delivery Application🚚

A modern, full-featured shipment delivery application built with React, TypeScript, and Tailwind CSS. Track, manage, and optimize your shipments with our comprehensive logistics platform.

![ShipTracker Pro](https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

### 🔐 **User Authentication**
- **Secure Registration & Login**: Email and password authentication
- **User Profiles**: Manage personal information and contact details
- **Session Management**: Persistent login sessions with secure logout

### 📦 **Shipment Management**
- **Create Shipments**: Easy-to-use form for new shipment creation
- **Multiple Service Types**: Standard (5 days), Express (2 days), Overnight (1 day)
- **Cost Calculator**: Automatic pricing based on weight, dimensions, and service type
- **Payment Integration**: Secure payment processing with instant confirmation

### 📍 **Real-time Tracking**
- **Live Status Updates**: Track shipments from creation to delivery
- **Detailed Timeline**: Complete tracking history with timestamps and locations
- **Status Notifications**: Visual indicators for each shipment stage
- **Search Functionality**: Find shipments by tracking number, sender, or receiver

### 📊 **Dashboard & Analytics**
- **Comprehensive Stats**: Total shipments, delivery status, spending analytics
- **Visual Indicators**: Color-coded status badges and progress indicators
- **Recent Activity**: Quick overview of latest shipments
- **Payment Tracking**: Monitor payment status for all shipments

### 🎨 **Modern UI/UX**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Apple-level Aesthetics**: Clean, sophisticated visual presentation
- **Smooth Animations**: Micro-interactions and transitions for enhanced UX
- **Accessibility**: WCAG compliant with proper contrast ratios and keyboard navigation

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase Account** (optional - app works offline with local storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shiptracker-pro.git
   cd shiptracker-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Environment Configuration](#environment-configuration))

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration (Optional - app works without these)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Example values for testing (replace with your actual Supabase credentials)
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Getting Supabase Credentials

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account

2. **Create a New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project name and database password
   - Select a region close to your users

3. **Get Your Credentials**
   - Go to **Settings** → **API**
   - Copy your **Project URL** (`VITE_SUPABASE_URL`)
   - Copy your **anon/public key** (`VITE_SUPABASE_ANON_KEY`)

4. **Set Up Database** (Optional)
   - The app works with local storage by default
   - For full database functionality, run the migration files in your Supabase SQL editor

### Local Storage Mode

**The app works perfectly without Supabase!** If you don't configure Supabase:
- ✅ All data is stored locally in your browser
- ✅ Full functionality including user registration, shipment creation, and tracking
- ✅ Data persists between browser sessions
- ✅ No backend dependencies required

## 📁 Project Structure

```
shiptracker-pro/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── Auth/          # Authentication components
│   │   ├── Dashboard/     # Dashboard and main app components
│   │   └── Payment/       # Payment processing components
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── lib/               # Utilities and configurations
│   │   ├── supabase.ts    # Supabase client configuration
│   │   └── localStorage.ts # Local storage utilities
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── supabase/
│   └── migrations/        # Database migration files
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Database (if using Supabase)
npm run db:push      # Push database migrations
```

## 🎯 Usage Guide

### 1. **User Registration**
- Click "Sign up" on the login page
- Fill in your details (name, email, phone, password)
- Account is created instantly

### 2. **Creating Shipments**
- Navigate to "Create Shipment" tab
- Fill in sender and receiver information
- Enter package details (weight, dimensions)
- Choose service type (Standard/Express/Overnight)
- Review cost calculation
- Complete payment process
- Shipment is created with tracking number

### 3. **Tracking Shipments**
- Use "Track Package" tab with any tracking number
- View detailed shipment information
- See complete tracking timeline
- Monitor delivery progress

### 4. **Managing Shipments**
- "My Shipments" shows all your shipments
- Filter by status or search by details
- View payment status and shipment details
- Track individual packages

## 🔒 Security Features

- **Input Validation**: All forms include client-side validation
- **Secure Storage**: Sensitive data is properly handled
- **Payment Security**: Simulated secure payment processing
- **Session Management**: Secure user session handling
- **Data Privacy**: User data is isolated and protected

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563eb)
- **Secondary**: Indigo (#4f46e5)
- **Success**: Green (#059669)
- **Warning**: Yellow (#d97706)
- **Error**: Red (#dc2626)
- **Neutral**: Gray scale

### Typography
- **Headings**: Inter font family, 120% line height
- **Body**: Inter font family, 150% line height
- **Code**: Monospace font family

### Spacing
- **8px Grid System**: All spacing follows 8px increments
- **Consistent Margins**: Standardized spacing throughout

## 🚀 Deployment

### Netlify Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Q: App shows "Supabase not configured" errors**
A: The app works perfectly without Supabase using local storage. These are just warnings and don't affect functionality.

**Q: Data disappears when I clear browser data**
A: In local storage mode, data is stored in your browser. For persistent data, set up Supabase.

**Q: Payment processing fails**
A: The payment system is simulated and always succeeds. This is for demonstration purposes.

### Getting Help

- 📧 **Email**: support@shiptracker.com
- 💬 **Discord**: [Join our community](https://discord.gg/shiptracker)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/shiptracker-pro/issues)
- 📖 **Documentation**: [Full Documentation](https://docs.shiptracker.com)

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Supabase** for the backend-as-a-service platform
- **Lucide React** for the beautiful icons
- **Vite** for the fast build tool

---

<div align="center">
  <p>Made with ❤️ by the ShipTracker Pro Team</p>
  <p>
    <a href="https://github.com/yourusername/shiptracker-pro">⭐ Star us on GitHub</a> •
    <a href="https://twitter.com/shiptrackerpro">🐦 Follow on Twitter</a> •
    <a href="https://shiptracker.com">🌐 Visit Website</a>
  </p>
</div>
