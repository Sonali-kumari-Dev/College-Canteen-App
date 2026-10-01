# College Canteen Management System

A modern and user-friendly **College Canteen Management System** developed as a CEP project to simplify food ordering and canteen management within a college environment.

The system provides separate functionality for students and canteen managers, making it easier to browse food items, place orders, manage menus, and handle canteen operations through a single platform.

## 🚀 Features

### 👨‍🎓 Student Features

* Student Registration & Login
* Browse Canteen Menu
* View Food Categories
* View Food Item Details and Prices
* Add Items to Cart
* Place Food Orders
* View Order Information
* User-friendly and responsive interface

### 👨‍💼 Manager Features

* Manager Registration & Login
* Manage Food Categories
* Add New Food Items
* Edit Food Items
* Delete Food Items
* Update Food Prices
* Manage Available Menu Items
* View and manage customer orders

## 🎨 UI & Design

* Modern and professional interface
* Responsive design for desktop and mobile devices
* Clean navigation
* User-friendly dashboard
* Consistent colour theme
* College-focused canteen experience
* Indian Rupee (₹) pricing

## 🛠️ Technologies Used

* React.js
* JavaScript
* HTML5
* CSS3
* Node.js
* Express.js
* MongoDB
* Google AI Studio
* Cloud Run

## 🏗️ System Workflow

```text
                College Canteen System
                         │
              ┌──────────┴──────────┐
              │                     │
           Student                Manager
              │                     │
        Registration/Login    Registration/Login
              │                     │
        Browse Menu          Manage Menu
              │                     │
        Select Food          Manage Categories
              │                     │
          Add to Cart        Manage Food Items
              │                     │
        Place Order          Manage Orders
              │                     │
              └──────────┬──────────┘
                         │
                   Canteen Database
```

## 📂 Project Structure

```text
College-Canteen/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── public/
├── server/
│   ├── routes/
│   ├── models/
│   └── ...
│
├── package.json
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the Project

```bash
cd College-Canteen
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file and add the required configuration for your database and other services.

```env
MONGODB_URI=your_mongodb_connection_string
```

Add any other environment variables required by the application.

### 5. Run the Project

```bash
npm run dev
```

The application will start on the local development server shown in the terminal.

## ☁️ Deployment

The project is designed to be deployed using **Google Cloud Run**, allowing the application to be accessed through a web browser on different devices.

## 🎯 Project Objective

The main objective of this project is to provide a digital platform for managing college canteen activities.

The system reduces the need for manual menu and order management and provides students with a convenient way to explore food items and place orders.

## 🔐 Data & User Management

The application supports separate user experiences for students and managers.

User information, menu data, and order-related information are stored through the application's database system.

No predefined personal accounts are required. Users can register using their own information.

## 📱 Responsive Design

The application is designed to work across:

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile Devices
* 📲 Tablet Devices

## 🔮 Future Enhancements

* Online payment integration
* Order status notifications
* Digital receipts
* Order history
* QR-code based ordering
* Sales analytics for managers
* Student feedback and ratings
* Canteen inventory management
* Real-time order tracking

## 👩‍💻 Developer

**Sonali Kumari**

Third Year Information Technology
VSIT, Mumbai

## 📄 Project Type

**College CEP Project**

Developed for academic and educational purposes.
