# LeaseTracker

A comprehensive lease management application for tracking property leases, payments, and generating payment vouchers.

## Features

- **User Management**: Separate roles for landlords and tenants
- **Property Management**: Track properties, units, and leases
- **Payment Tracking**: Monitor lease payments and their status
- **Voucher Generation**: Automatically generate payment vouchers
- **Email Notifications**: Send payment vouchers to tenants via email

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Containerization**: Docker for database

## Project Structure

The project follows Next.js best practices with a `src` directory structure:

```
src/
├── app/                  # Next.js App Router
│   ├── api/              # API Route Handlers
│   ├── dashboard/        # Dashboard page
│   ├── vouchers/         # Voucher pages
│   └── page.tsx          # Home page
├── components/           # React components
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema
└── utils/                # Utility functions
    └── db.ts             # Prisma client
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MySQL client (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lease-tracker.git
   cd lease-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the MySQL database:
   ```bash
   docker-compose up -d
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Seed the database:
   ```bash
   npx prisma db seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main models:

- **User**: Authentication and user information
- **Landlord**: Property owners
- **Tenant**: Property renters
- **Property**: Real estate properties
- **Unit**: Individual units within properties
- **Lease**: Rental agreements
- **Payment**: Lease payments
- **Voucher**: Payment receipts
- **Document**: Lease-related documents

## API Routes

- **GET /api/payments**: Get all payments
- **POST /api/payments**: Create a new payment
- **GET /api/vouchers**: Get all vouchers
- **GET /api/vouchers/[id]**: Get a specific voucher
- **POST /api/vouchers/send**: Send a voucher via email

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- TailwindCSS for the utility-first CSS framework
