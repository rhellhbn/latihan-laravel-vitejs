import React from "react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { usePage } from "@inertiajs/react";

export default function HomePage() {
    const { auth } = usePage().props;

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: "&#128075;",
                                }}
                            />
                            Hai! {auth.name}
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Apa yang ingin kamu pelajari hari ini?
                        </p>
                        <Button
    onClick={() => (window.location.href = "/todos")}
    className="bg-blue-600 hover:bg-blue-700 text-white mt-5"
>
    Lihat Daftar Kegiatan
</Button>
                    </div>
                    {/* Technologies Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"></div>
                </div>
            </div>
        </AppLayout>
    );
}