"use client";

import styles from "./signin.module.css";
import Image from "next/image";
import acleyLogo from "../assets/newAcleyLogo-removebg-preview.png";
import { useState } from "react";
import Link from "next/link";
import { setToken } from "./auth";
import { useRouter } from "next/navigation";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        setIsError(false);
        setIsLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                setIsError(true);
                return;
            }

            const token: string = await res.json();
            setToken(token);
            router.push("/content/cards");
        } catch (err) {
            alert("Erro: " + err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.page}>
            {/* Ambient background glow */}
            <div className={styles.glow} />

            {/* Card */}
            <div className={styles.card}>
                {/* Logo */}
                <div className={styles.logoWrap}>
                    <Image src={acleyLogo} alt="Acley" width={56} height={56} className={styles.logo} />
                </div>

                <div className={styles.heading}>
                    <h1 className={styles.title}>Bem-vindo de volta</h1>
                    <p className={styles.subtitle}>Entre na sua conta para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="email">Email</label>
                        <div className={styles.inputWrap}>
                            <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="16" x="2" y="4" rx="2"/>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                            </svg>
                            <input
                                id="email"
                                className={styles.input}
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="password">Senha</label>
                        <div className={styles.inputWrap}>
                            <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <input
                                id="password"
                                className={styles.input}
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    {isError && (
                        <div className={styles.errorBanner}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            Email ou senha incorretos
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.spinner} />
                        ) : (
                            <>
                                Entrar
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <p className={styles.footer}>
                    Não tem uma conta?{" "}
                    <Link href="/signup" className={styles.footerLink}>
                        Criar conta
                    </Link>
                </p>
            </div>
        </div>
    );
}