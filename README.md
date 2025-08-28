# ZhiShi - A Web Application for Plant Identification and Education

ZhiShi is an interactive web application designed to help users learn about different plant families, identify plants using a powerful AI-powered natural language search, and test their botanical knowledge through engaging quizzes. This project runs entirely in your browser, using a local AI model to ensure your data stays private.

## Key Features

- **AI-Powered Plant Identifier:** Describe a plant in your own words (e.g., "it has square stems and leaves in pairs") and the in-browser AI will identify the most likely plant families using semantic search. The entire process runs locally on your device—no data is ever sent to a server.
- **Comprehensive Encyclopedia:** Browse and search a detailed database of plant families, complete with descriptions, traits, common species, and images.
- **Varied Botanical Quizzes:** Test your knowledge with multiple quiz formats, including text-based and image-based challenges, from a central quiz selection page.
- **Fully Responsive:** Enjoy a seamless experience whether you're on a desktop or mobile device.

## Technology Stack

- **Frontend:** [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **AI/ML:** [Transformers.js](https://github.com/xenova/transformers.js) (`@xenova/transformers`) for in-browser semantic search.
  - **Model:** `bge-small-zh-v1.5` for Chinese language sentence embeddings.
- **Routing:** [React Router](https://reactrouter.com/)
- **Data Fetching/State:** [TanStack Query](https://tanstack.com/query/latest)

## How the AI Identifier Works

The plant identifier uses a modern machine learning technique called **semantic search** to understand your descriptions. Here’s a simplified breakdown of the process:

1.  **In-Browser AI:** The app uses [Transformers.js](https://github.com/xenova/transformers.js) to run a sophisticated AI model (`bge-small-zh-v1.5`) directly in your web browser. No special hardware or software is needed.
2.  **Embeddings Generation:** When you type a description, the model converts your words into a numerical representation called an "embedding." It does the same for all the plant traits stored in its database.
3.  **Cosine Similarity:** The AI then compares the embedding of your query with the embedding of each plant trait using a mathematical calculation called "cosine similarity." This measures the "semantic distance" or similarity in meaning between your description and the traits.
4.  **Ranking Results:** The traits that are most semantically similar to your description are ranked highest, and the app shows you the corresponding plant families as the most likely matches.

Because this entire process happens on your computer (client-side), your search queries are completely private and the tool works even when you're offline (after the initial page load).

## File Structure

- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration file
- `tailwind.config.js` - Tailwind CSS configuration file
- `package.json` - NPM dependencies and scripts
- `src/App.tsx` - Root component of the project
- `src/main.tsx` - Project entry point
- `src/index.css` - Global CSS styles
- `src/pages/` - Contains the main pages of the application (Home, Encyclopedia, PlantIdentifier, Quiz).
- `src/components/` - Contains reusable React components, including UI elements from shadcn/ui.
- `src/data/` - Contains the plant data used by the application.

## Components

- All shadcn/ui components are pre-downloaded and available at `@/components/ui`. You can find more components and documentation at [shadcn/ui](https://ui.shadcn.com/).

## Styling

- Global styles are defined in `src/index.css`.
- Tailwind CSS utility classes are used for styling components. You can customize the theme and styles in `tailwind.config.js`.

## Getting Started

This project uses `pnpm` for package management. It is strongly recommended to use `pnpm` to ensure that the exact dependency versions from the lockfile (`pnpm-lock.yaml`) are used.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/installation) (v8 or higher)

### Installation and Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yuzhounaut/ZhiShi.git
    cd ZhiShi
    ```

2.  **Install Dependencies:**
    ```bash
    pnpm install
    ```
    This command will install all the necessary dependencies based on the `pnpm-lock.yaml` file.

3.  **Start the Development Server:**
    ```bash
    pnpm run dev
    ```
    This will start the Vite development server, typically available at `http://localhost:5173`.

    **Note:** The first time you run the application and access the AI Identifier, the machine learning models will be downloaded and cached by your browser. This might take a moment, so please be patient.

4.  **Build for Production:**
    ```bash
    pnpm run build
    ```
    This command compiles the application into static assets in the `dist/` directory, ready for deployment.

## Note

The `@/` path alias points to the `src/` directory.
