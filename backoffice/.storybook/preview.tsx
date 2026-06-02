import type { Preview } from "@storybook/nextjs-vite";
import React, { useEffect } from "react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      test: "todo",
    },
  },

  // 툴바에서 라이트/다크 전환 (우리 .dark 클래스 전략과 동일)
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
