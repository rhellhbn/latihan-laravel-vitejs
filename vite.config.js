import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/css/trix-custom.css", // ← TAMBAHAN untuk Trix Editor
                "resources/js/app.jsx"
            ],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            "@": "/resources/js",
            "@/components": "/resources/js/components",
            "@/lib": "/resources/js/lib",
        },
    },
    optimizeDeps: {
        include: ["lucide-react"],
    },
});