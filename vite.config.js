import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/css/trix-custom.css",
                "resources/js/app.jsx"
            ],
            refresh: true
        }),
        react(),
    ],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./resources/js"),
            "@/components": path.resolve(__dirname, "./resources/js/components"),
            "@/lib": path.resolve(__dirname, "./resources/js/lib"),
        },
    },
});
