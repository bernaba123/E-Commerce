# EthioConnect Backend API

A comprehensive backend API for the Ethiopian-German E-commerce Platform built with Node.js, Express.js, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete user CRUD operations with admin controls
- **Product Management**: Full product catalog management for Ethiopian goods
- **Order System**: Complete order processing and tracking
- **Request System**: International product request handling
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Database**: MongoDB with Mongoose ODM

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ethio-german-marketplace
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@ethioconnect.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - Get user statistics

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get single product (public)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `POST /api/products/:id/reviews` - Add review (authenticated)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/admin/stats` - Get product statistics (admin)

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin)
- `GET /api/orders/my-orders` - Get user orders
- `PUT /api/orders/:id/tracking` - Update tracking (admin)
- `GET /api/orders/admin/stats` - Get order statistics (admin)

### Requests
- `GET /api/requests` - Get all requests (admin)
- `GET /api/requests/:id` - Get single request
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id/status` - Update request status (admin)
- `GET /api/requests/my-requests` - Get user requests
- `PUT /api/requests/:id/tracking` - Update tracking (admin)
- `GET /api/requests/admin/stats` - Get request statistics (admin)

## Default Admin Account

The system automatically creates an admin account on first run:
- **Email**: admin@ethioconnect.com
- **Password**: admin123
- **Role**: admin

## Database Models

### User
- Personal information and authentication
- Role-based access (user/admin)
- Address and contact details

### Product
- Ethiopian product catalog
- Categories, pricing, and inventory
- Reviews and ratings system

### Order
- Order processing and tracking
- Payment and shipping information
- Status management

### Request
- International product requests
- Status tracking and admin management
- Cost estimation and processing

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Input validation and sanitization
- Helmet security headers
- Environment variable protection

## Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- Custom error responses
- Development vs production error details

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Project Structure
```
backend/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
├── .env           # Environment variables
├── server.js      # Main server file
└── package.json   # Dependencies
```

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write clear commit messages
5. Test your changes thoroughly

## License

This project is licensed under the MIT License.