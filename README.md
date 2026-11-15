# TaskFlow — Task Manager

A simple, responsive task manager built with Next.js, React, TypeScript and Tailwind CSS. It is ready to run locally and deploy to Vercel.

## Features

- Create, edit and delete tasks
- Mark tasks complete or move them between To do / In progress / Done
- Set start dates, due dates, priorities and categories
- Track progress automatically from task status
- Search and filter tasks
- Dashboard counts, completion rate and overdue list
- Upcoming deadlines
- Browser local storage persistence (no database setup required for this starter)

## Requirements

- Node.js 18.18+ (Node.js 20 LTS recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Create a new GitHub repository.
2. Extract this ZIP and copy the contents into the repository.
3. Commit and push the files to GitHub.
4. In Vercel, choose **Add New → Project**, import the repository and deploy.
5. Framework preset should be detected as Next.js. Build command: `npm run build`.

No environment variables are required for this starter.

## Important data note

This first version saves tasks in the browser's `localStorage`. Data is available in the same browser on the same device, but it does not sync across devices or users. For multi-device access, authentication, and team collaboration, connect a database such as Supabase in a next iteration. Do not store sensitive or business-critical information in this local-only version.

## Suggested next improvements

- Supabase database and authentication
- Daily/weekly email reminders using a scheduled function
- Calendar and Gantt/timeline views
- Team workspaces and task assignment
