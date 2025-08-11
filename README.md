# E-Vote Poll Platform 🗳️

A real-time polling platform built with Next.js, MongoDB, and Chart.js for visualizing live results.


<img width="1880" height="896" alt="Screenshot (664)" src="https://github.com/user-attachments/assets/d0e86504-1392-4a8e-ad3c-c15b415212cc" /> 

<img width="1870" height="882" alt="Screenshot (663)" src="https://github.com/user-attachments/assets/7605cbb4-dcaf-43a1-b043-bd8b51dcf266" />

<img width="1897" height="883" alt="Screenshot (659)" src="https://github.com/user-attachments/assets/a59191e2-e397-44db-9924-f1386901c34a" />

<img width="1859" height="877" alt="Screenshot (662)" src="https://github.com/user-attachments/assets/29620a93-4bf8-4f4f-b7f8-219d443dfa4f" />



Live Demo: [https://e-vote-poll-platform.vercel.app](https://e-vote-poll-platform-f0j2bw1q2-natan-muletas-projects.vercel.app)

## Features ✨

- **Real-time voting** with live results
- **Multiple question types**: Multiple choice, open-ended
- **Beautiful data visualization** with interactive charts
- **User authentication** for poll creators
- **Responsive design** works on all devices
- **Analytics dashboard** with demographic insights

## Tech Stack 🛠️

### Frontend
- **Next.js 14** (App Router)
- **Tailwind CSS** + **Shadcn/ui** components
- **Chart.js** for data visualization
- **React Hook Form** for form handling

### Backend
- **Next.js API Routes** (Edge-ready)
- **Clerk** for authentication
- **WebSockets** for real-time updates

### Database
- **MongoDB Atlas** (NoSQL database)
- **Mongoose** ODM

## API Specification 📡

| Method | Endpoint                | Description                          |
|--------|-------------------------|--------------------------------------|
| POST   | /api/auth/register      | Register new user                    |
| POST   | /api/auth/login         | User login                           |
| POST   | /api/polls              | Create new poll                      |
| GET    | /api/polls/:id          | Get poll details                     |
| POST   | /api/polls/:id/vote     | Submit vote                          |
| GET    | /api/polls/:id/results  | Get poll results with chart data     |

## Development Setup 🛠️

1. Clone the repository:
```bash
git clone https://github.com/yourusername/e-vote-poll-platform.git

    Install dependencies:

bash

npm install
# or
yarn install
# or
pnpm install

    Set up environment variables:

bash

cp .env.example .env.local

Fill in your MongoDB and Clerk credentials

    Run the development server:

bash

npm run dev
# or
yarn dev
# or
pnpm dev

Deployment 🚀

The platform is deployed on Vercel:
https://e-vote-poll-platform.vercel.app

https://vercel.com/button
Roadmap 🗺️

    Basic polling functionality

    Real-time results

    User authentication

    Advanced analytics

    Poll scheduling

    Email notifications

    API documentation with Swagger

Contributing 🤝

Contributions are welcome! Please open an issue or submit a pull request.
License 📜

This project is licensed under the MIT License.
text


For your repository structure, I recommend organizing it like this:

/
├── app/
│ ├── (auth)/
│ ├── dashboard/
│ ├── polls/
│ ├── api/ (API routes)
├── components/
│ ├── ui/ (Shadcn components)
│ ├── charts/
│ ├── PollCard.jsx
│ └── ...
├── lib/
│ ├── db.js (Mongoose connection)
│ └── ...
├── public/
├── styles/
└── ...
text


Best practices for your repo:
1. Use meaningful commit messages
2. Keep issues updated
3. Add proper documentation
4. Use branches for features
5. Include a CONTRIBUTING.md
6. Add a CODE_OF_CONDUCT.md

For images, upload screenshots of:
1. The voting interface
2. Results dashboard
3. Mobile responsive views
4. Chart visualizations
5. Admin/create poll screens

Would you like me to provide specific implementation details for any part of this?
