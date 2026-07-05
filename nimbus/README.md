This is the [Next.js](https://nextjs.org) frontend workspace for Nimbus.

The top-level repository has a root `package.json` that can install, run, and build both the frontend and backend together. This package still keeps its own `package.json` for frontend-specific scripts and dependencies.

## Getting Started

From the repository root, install all workspace dependencies:

```bash
cd C:\Nimbus
npm install
```

Then run the frontend and backend together:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To run only the frontend from the repository root:

```bash
npm run dev:frontend
```

You can also run frontend commands directly from this folder:

```bash
cd C:\Nimbus\nimbus
npm run dev
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Available Commands

From the repository root:

| Command                  | Description                             |
| ------------------------ | --------------------------------------- |
| `npm run dev`            | Start the frontend and backend together |
| `npm run dev:frontend`   | Start only this Next.js frontend        |
| `npm run build:frontend` | Build only this frontend                |

From `C:\Nimbus\nimbus`:

| Command         | Description                                 |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Start the Next.js development server        |
| `npm run build` | Build the frontend for production           |
| `npm run start` | Start the production frontend after a build |
| `npm run lint`  | Run ESLint                                  |

## Backend API

The backend API lives in `C:\Nimbus\nimbus\server`. When both apps are running, the API health check is available at [http://127.0.0.1:4000/health](http://127.0.0.1:4000/health).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
