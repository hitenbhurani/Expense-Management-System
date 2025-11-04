# Portfolio Management System - Setup Instructions

## 🚀 **Complete Portfolio & Asset Management System**

This is a comprehensive **Portfolio Management System** for tracking and analyzing your investment portfolio with advanced analytics and reporting features.

## Features Implemented

### 1. **Asset Management**
- Add, Edit, Delete investment assets
- Support for multiple asset types: Stocks, Bonds, Real Estate, Cryptocurrency, Commodities, Mutual Funds, ETFs, Fixed Deposits, Gold, and Other
- Track purchase price, current price, quantity, and performance
- Asset status management (Active, Hold, Sold)

### 2. **Advanced Analytics Dashboard**
- **Portfolio Overview**: Total value, investment, P&L, return percentage
- **Asset Distribution**: Visual breakdown by asset type
- **Performance Analysis**: Top and worst performing assets
- **Risk Metrics**: Diversification score and concentration risk
- **Real-time Statistics**: Profitable vs loss-making assets

### 3. **Comprehensive Reporting System**
- **Summary Report**: Portfolio overview and key metrics
- **Performance Report**: Detailed performance analysis
- **Diversification Report**: Asset allocation and recommendations
- **Detailed Report**: Complete portfolio analysis

### 4. **Professional UI/UX**
- Modern, responsive interface with Ant Design
- Beautiful gradient backgrounds and card designs
- Tabbed navigation (Portfolio Management & Analytics)
- Advanced data table with sorting, filtering, and pagination
- Real-time profit/loss calculations with color coding
- Interactive charts and progress bars
- Real-time data updates with live toggle

### 5. **Advanced Analytics & Visualizations**
- **Real-time Charts**: Dynamic pie charts, bar charts, area charts, and line charts
- **Portfolio Performance Trend**: Visual representation of portfolio growth over time
- **Asset Type Distribution**: Interactive pie chart showing portfolio allocation
- **Performance Analysis**: Top and worst performing assets with detailed metrics
- **Risk Assessment**: Diversification scoring and concentration risk analysis

### 6. **Comprehensive Reporting System**
- **Functional Reports**: All report buttons now show actual data output
- **Summary Report**: Portfolio overview with key metrics
- **Performance Report**: Detailed performance analysis with best/worst performers
- **Diversification Report**: Asset allocation analysis with recommendations
- **Detailed Report**: Complete portfolio analysis with multiple sections
- **Report Modal**: Professional report display with download options

### 7. **Admin Panel System**
- **Complete Admin Dashboard**: Comprehensive system management interface
- **User Management**: View, edit, delete, and manage user roles
- **System Analytics**: Platform-wide statistics and user activity
- **Asset Management**: Admin view of all user assets
- **Real-time Charts**: System-wide analytics with beautiful visualizations
- **User Role Management**: Promote users to admin or manage user status

## Setup Steps

### 1. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Environment Configuration
The `.env` file is already configured with your MongoDB credentials:
```env
PORT=5000
MONGO_URI=mongodb+srv://HitenAdmin:HitenAdmin@cluster0.mjd6ikb.mongodb.net/expense_db
NODE_ENV=development
```

### 3. Running the Application

#### Option 1: Easy Start (Windows)
Double-click `start.bat` file - this will open two command windows automatically

#### Option 2: Run both server and client together
```bash
npm run dev
```

#### Option 3: Run separately
```bash
# Terminal 1 - Start server
npm run server

# Terminal 2 - Start client
npm run client
```

### 4. What's New - Complete Expense Management System
✅ **Full CRUD Operations**: Add, Edit, Delete expenses and income  
✅ **Real-time Statistics**: Total Income, Expenses, Balance, Transaction Count  
✅ **Category Management**: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Education, Other  
✅ **Income & Expense Tracking**: Separate tracking for both income and expenses  
✅ **Responsive UI**: Modern interface with Ant Design components  
✅ **Data Persistence**: All data stored in MongoDB  
✅ **User Authentication**: Secure login/logout system  

### 5. Access the Application
- **Server**: http://localhost:5000
- **Client**: http://localhost:3000
- **API Base URL**: http://localhost:5000/api/v1

### 5. Default Admin Access
A default admin user has been created for you:
- **Email**: admin@portfolio.com
- **Password**: admin123
- **Role**: admin

**To access the admin panel:**
1. Login with the admin credentials above
2. Click "Admin Panel" in the navigation menu
3. Access comprehensive system management features

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run server` - Start the server in development mode with nodemon
- `npm run client` - Start the React client
- `npm run dev` - Start both server and client concurrently

## API Endpoints

### User Management
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/register` - User registration

### Portfolio Management
- `POST /api/v1/portfolio/get-all-assets` - Get all user assets
- `POST /api/v1/portfolio/add-asset` - Add new asset
- `PUT /api/v1/portfolio/update-asset/:id` - Update asset
- `DELETE /api/v1/portfolio/delete-asset/:id` - Delete asset
- `POST /api/v1/portfolio/get-portfolio-analytics` - Get analytics data
- `POST /api/v1/portfolio/get-portfolio-report` - Generate reports

## How to Use

### Adding Assets
1. Click "Add Asset" button
2. Fill in asset details:
   - **Asset Name**: e.g., "Apple Inc.", "Bitcoin"
   - **Asset Type**: Select from dropdown (Stocks, Bonds, etc.)
   - **Description**: Brief description
   - **Quantity**: Number of units/shares
   - **Purchase Price**: Price when bought
   - **Current Price**: Current market price
   - **Purchase Date**: When you bought it
   - **Status**: Active, Hold, or Sold

### Viewing Analytics
1. Go to "Analytics & Reports" tab
2. View:
   - **Asset Distribution**: See how your portfolio is allocated
   - **Performance Overview**: Profitable vs loss-making assets
   - **Top/Worst Performers**: Best and worst performing assets
   - **Diversification Score**: Portfolio diversification rating

### Generating Reports
Click any report button to generate:
- **Summary Report**: Overall portfolio summary
- **Performance Report**: Detailed performance analysis
- **Diversification Report**: Asset allocation analysis
- **Detailed Report**: Complete portfolio report

## API Endpoints

- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/register` - User registration

## Troubleshooting

### Port Already in Use Error
If you get "EADDRINUSE" error:
1. Find the process using port 5000: `netstat -ano | findstr :5000`
2. Kill the process: `taskkill /PID <process_id> /F`

### MongoDB Connection Issues
1. Check your MongoDB URI is correct
2. Ensure your IP is whitelisted in MongoDB Atlas
3. Verify your database credentials

### Client Not Connecting to Server
1. Ensure server is running on port 5000
2. Check that client proxy is configured correctly in client/package.json
3. Verify CORS is enabled in server.js
