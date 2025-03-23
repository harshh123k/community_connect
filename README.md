# Internship Portal

A web application that connects NGOs with volunteers for internship opportunities. The platform facilitates project management and volunteer coordination for social impact initiatives.

## Features

- **Multi-User System**: Support for Volunteers, NGOs, and Government officials
- **Project Management**: Create, manage, and track social impact projects
- **Volunteer Management**: Register, approve, and coordinate volunteers
- **Real-time Statistics**: Dashboard with active projects and volunteer statistics
- **Profile Management**: Detailed profiles for all user types

## Tech Stack

- **Frontend**: React.js with Chakra UI
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

4. Create a `config.env` file in the server directory with:
   ```
   PORT=5003
   MONGODB_URI=mongodb://localhost:27017/internship-portal
   JWT_SECRET=your_jwt_secret
   ```

5. Start the server:
   ```bash
   cd server
   npm start
   ```

6. Start the client:
   ```bash
   cd client
   npm start
   ```

The application will be available at `http://localhost:3000`

## User Types

1. **Volunteers**
   - Register and create profiles
   - Browse and apply for projects
   - Track application status
   - View project details

2. **NGOs**
   - Create and manage projects
   - Review volunteer applications
   - Track project progress
   - Manage volunteer assignments

3. **Government Officials**
   - Monitor NGO activities
   - View project statistics
   - Access system-wide reports

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details