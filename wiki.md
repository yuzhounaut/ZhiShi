# Project Summary
The "Plant Identification (Zhi Shi) - Lite Version" is a responsive web application that allows users to identify various plant species effortlessly. It features an interactive quiz system and a comprehensive plant encyclopedia, enabling users to explore plant characteristics without the need for registration. The project emphasizes a seamless user experience, making plant education accessible to everyone.

# Project Module Description
The project consists of several functional modules:
1. **Global Navigation Header**: A sticky header with the logo and navigation links.
2. **Home Page**: Displays plant family quiz selection cards.
3. **Interactive Q&A Module**: Engages users with quizzes that track progress and provide feedback.
4. **Plant Identification Module**: Enables users to identify plants based on selected traits.
5. **Plant Encyclopedia**: A searchable database containing detailed information about various plant families.

# Directory Tree
```
shadcn-ui/
├── README.md                # Project overview and documentation
├── components.json          # Configuration for UI components
├── eslint.config.js         # ESLint configuration for code quality
├── index.html               # Main HTML file
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── public/                  # Public assets
│   ├── favicon.svg          # Favicon for the application
│   └── robots.txt           # Robots.txt for web crawlers
├── src/                     # Source code for the application
│   ├── App.css              # Global CSS styles
│   ├── App.tsx              # Main application component
│   ├── components/          # UI components
│   ├── data/                # Contains plant data
│   │   └── plantData.ts     # Plant database with species data
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Application pages
│   │   └── Home.tsx         # Home page component
│   ├── index.css            # Entry CSS file
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite environment type definitions
├── tailwind.config.ts       # Tailwind CSS configuration
├── template_config.json      # Configuration for templates
├── tsconfig.app.json        # TypeScript configuration specific to the application
├── tsconfig.json            # General TypeScript configuration
└── vite.config.ts           # Vite configuration for building the application
```

# File Description Inventory
- **README.md**: Overview and instructions for the project.
- **components.json**: Configuration for UI components.
- **eslint.config.js**: Rules and settings for ESLint.
- **index.html**: Main entry point for the web application.
- **package.json**: Lists dependencies and scripts.
- **postcss.config.js**: Configuration for PostCSS.
- **public/**: Directory for static assets.
- **src/**: Contains the source code, including components, data, hooks, pages, and styles.
- **tailwind.config.ts**: Configuration for Tailwind CSS.
- **template_config.json**: Configuration for template management.
- **tsconfig.app.json**: TypeScript configuration specific to the application.
- **tsconfig.json**: Main TypeScript configuration file.
- **vite.config.ts**: Configuration for Vite.

# Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Linting**: ESLint
- **Styling**: PostCSS, Tailwind CSS

# Usage
To get started with the project, follow these steps:
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Build the application:
   ```bash
   pnpm run build
   ```
3. Run the application:
   ```bash
   pnpm run start
   ```
