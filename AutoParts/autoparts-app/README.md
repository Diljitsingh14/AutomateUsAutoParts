# Auto Parts Manager

A utility application for auto parts supplier companies to manage and retrieve parts data from third-party services.

## Features

- **Upload Excel/CSV Files**: Process and upload parts data from Excel or CSV files
- **Parts by Make**: Download parts data filtered by vehicle manufacturer
- **Parts by Service Line**: Search and retrieve parts using service line IDs
- **MongoDB Integration**: Store service line IDs for historical data (2000-2005)
- **Third-Party API Integration**: Fetch latest MSRP data on demand

## Setup

### Prerequisites

- Node.js 18+ 
- MongoDB account
- Access to third-party auto parts API

### Installation

1. Navigate to the project directory:
```bash
cd autoparts-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create or update `.env` file in the root directory:

```env
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/
ID_TOKEN=your_third_party_token_here
```

**Important**: You must manually login to the third-party service and obtain the authentication token, then replace `ID_TOKEN` in the `.env` file.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

### Obtaining the Third-Party Token

1. Manually login to the third-party auto parts service
2. Extract the authentication token from your session
3. Update the `ID_TOKEN` value in your `.env` file
4. Restart the development server if running

### Uploading Data

1. Navigate to the "Upload Excel File" section
2. Select your Excel or CSV file containing parts data
3. Click upload to process the file

### Downloading Parts by Make

1. Go to "Parts by Make"
2. Select a vehicle manufacturer from the dropdown
3. Click "Get Parts" to fetch data from MongoDB
4. Download the results as CSV

### Downloading Parts by Service Line

1. Navigate to "Parts by Service Line"
2. Enter a service line ID
3. Click "Get Parts" to fetch the data
4. Download the results as JSON

## Project Structure

```
autoparts-app/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── upload/            # File upload endpoint
│   │   │   ├── parts-by-make/     # Get parts by manufacturer
│   │   │   ├── parts-by-service-line/ # Get parts by service ID
│   │   │   └── part-details/      # Fetch part details from API
│   │   ├── upload/                # Upload page
│   │   ├── parts-by-make/         # Parts by make page
│   │   ├── parts-by-service-line/ # Parts by service line page
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Homepage
│   └── lib/
│       ├── api/                   # API utilities
│       │   └── fetchData.ts       # Third-party API integration
│       ├── db/                    # Database
│       │   ├── mongodb.ts         # MongoDB connection
│       │   └── models/            # Mongoose models
│       └── utils/                 # Utilities
│           └── excelHelper.ts     # Excel file processing
├── uploads/                       # Uploaded files directory
├── .env                          # Environment variables
└── package.json
```

## API Endpoints

### POST /api/upload
Upload and process Excel/CSV files
- **Body**: multipart/form-data with `excelFile` field
- **Response**: JSON with upload status and preview data

### GET /api/parts-by-make?make={make}
Get parts by vehicle manufacturer
- **Query**: `make` - Vehicle manufacturer name
- **Response**: JSON array of parts

### GET /api/parts-by-service-line?serviceLineId={id}
Get parts by service line ID
- **Query**: `serviceLineId` - Service line identifier
- **Response**: JSON object with service line details

### GET /api/part-details?partNumber={number}
Fetch part details from third-party API
- **Query**: `partNumber` - Part number to lookup
- **Response**: JSON with part details including MSRP

## Technologies Used

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **MongoDB & Mongoose**: Database and ODM
- **Axios**: HTTP client for API requests
- **XLSX**: Excel file processing

## Notes

- The third-party service does not provide official API or Excel download features, hence this utility application
- Service IDs are stored in MongoDB for historical vehicle data (2000-2005)
- Authentication token must be manually refreshed when it expires
- Uploaded files are stored in the `uploads/` directory

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
