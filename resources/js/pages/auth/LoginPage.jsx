
import React from "react";
import { useForm, usePage } from "@inertiajs/react";
import AuthLayout from "@/layouts/AuthLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldGroup,
} from "@/components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    // Ambil data dari controller Laravel
    const { success } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        post("/auth/login/post");
    };

    return (
        <AuthLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="w-[360px] mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Masuk ke akun Anda</CardTitle>
                            <CardDescription>
                                Masukkan email Anda untuk masuk ke akun
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {success && (
                                <div className="mb-4">
                                    <Alert>
                                        <CheckCircle2Icon />
                                        <AlertTitle>Success!</AlertTitle>
                                        <AlertDescription>
                                            {success}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="email">
                                            Email
                                        </FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="contoh@email.com"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                        />
                                        {errors.email && (
                                            <div className="text-sm text-red-600">
                                                {errors.email}
                                            </div>
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="password">
                                            Kata Sandi
                                        </FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Masukkan kata sandi"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {errors.password && (
                                            <div className="text-sm text-red-600">
                                                {errors.password}
                                            </div>
                                        )}
                                    </Field>
                                    <Field>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? "Memproses..."
                                                : "Masuk"}
                                        </Button>
                                        <FieldDescription className="text-center">
                                            Belum punya akun?{" "}
                                            <a
                                                href="/auth/register"
                                                className="text-primary hover:underline"
                                            >
                                                Daftar di sini
                                            </a>
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthLayout>
    );
}