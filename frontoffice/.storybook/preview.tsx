import type { Preview } from "@storybook/nextjs-vite";
import React, { useEffect } from "react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "todo" },
  },
  globalTypes: {
    theme: {
      description: "테마",
      defaultValue: "light",
      toolbar: {
        title: "테마",
        icon: "sun",
        items: [
          { value: "light", title: "라이트", icon: "sun" },
          { value: "dark", title: "다크", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as "light" | "dark";
      useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
      }, [theme]);
      return (
        <div className="bg-canvas text-fg min-h-screen p-6">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
