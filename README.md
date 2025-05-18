# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d75c2a49-0921-4ed9-be7f-0749c8d28ff4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d75c2a49-0921-4ed9-be7f-0749c8d28ff4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d75c2a49-0921-4ed9-be7f-0749c8d28ff4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## EmailJS Setup

The contact form is configured to use EmailJS with the following credentials:
- Service ID: service_36ir31n
- Template ID: template_o7ly4st
- Public Key: fgIKeHPKwZTZx28Nn

To use the provided HTML email template:
1. Log in to [EmailJS](https://www.emailjs.com/)
2. Go to "Email Templates" and open the template with ID "template_o7ly4st"
3. Delete the existing HTML content
4. Paste the entire contents of `email_template.html` from the project root
5. Make sure your template contains the following variables:
   - `{{from_name}}` - The sender's name
   - `{{from_email}}` - The sender's email
   - `{{subject}}` - The email subject
   - `{{message}}` - The email message
6. Save the template

The contact form will now send beautifully formatted emails to levin.fritz@bluewin.ch when users submit the form.

## Supabase Database Setup

To fix the history entry deletion issue and set up the database correctly:

1. Go to the [Supabase dashboard](https://app.supabase.com) and select your project
2. Navigate to "SQL Editor"
3. Create a new query and paste the entire contents of the updated `supabase/pdf_history_cleanup.sql` file
4. Run the SQL query to create:
   - The pdf_history table with proper structure
   - Row-level security policies to ensure users can only access their own data
   - Stored procedures for safely deleting history entries
   - A cleanup function to remove entries older than 7 days

Note: The original script included a scheduled task using pg_cron, but this extension may not be available in your Supabase instance. The updated script implements a manual cleanup function that runs when users visit the History page.

This implementation ensures:
- Users can only view, create, and delete their own history entries
- The "delete entry" and "clear history" functions work properly and persist changes
- Old entries are automatically cleaned up to save database space

After implementing these changes, history deletion will work correctly and persist across page refreshes.
