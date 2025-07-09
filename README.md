# ZhiShi - A Web Application for Plant Identification and Education

ZhiShi is an interactive web application designed to help users learn about different plant families, identify plants based on their characteristics, and test their botanical knowledge through quizzes.

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

All shadcn/ui components have been downloaded under `@/components/ui`.

## Features

- **Plant Encyclopedia:** Browse and search a comprehensive database of plant families. Each entry includes detailed descriptions, characteristics, common species, and images.
- **Plant Identifier:** An interactive tool to help you identify plants by selecting their observed traits (e.g., leaf type, flower color, growth habit).
- **Botanical Quiz:** Test your knowledge of plant families and their characteristics with engaging quizzes.
- **Responsive Design:** Enjoy a seamless experience across desktop and mobile devices.

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

### Prerequisites

- Node.js (version 16 or higher recommended)
- pnpm (or npm/yarn)

### Installation and Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yuzhounaut/ZhiShi.git
    cd ZhiShi
    ```

2.  **Install Dependencies:**
    ```shell
    pnpm install
    ```

3.  **Start the Development Server:**
    ```shell
    pnpm run dev
    ```
    This will start the Vite development server, and you can view the application in your browser, usually at `http://localhost:5173`.

4.  **Build for Production:**
    ```shell
    pnpm run build
    ```
    This command compiles the application into static assets in the `dist/` directory, ready for deployment.

## Note

The `@/` path alias points to the `src/` directory.
