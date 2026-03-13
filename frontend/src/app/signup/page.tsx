"use client";

import styles from "./signup.module.css";
import Image from "next/image";
import acleyLogo from "../assets/newAcleyLogo-removebg-preview.png";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const router = useRouter();

    async function createFirstNotebook(idUser: number) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nameNotebook: "Sem título", idUser }),
        });
        if (!res.ok) throw new Error("Erro ao criar notebook");
        return res.json();
    }

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (!res.ok) {
                alert("Erro ao criar conta!");
                return;
            }

            const result = await res.json();
            await createFirstNotebook(result[0].id);
            setIsDone(true);
            setTimeout(() => router.push("/signin"), 1800);
        } catch (err) {
            alert("Erro: " + err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.glow} />

            <div className={styles.card}>
                {/* Logo */}
                <div className={styles.logoWrap}>
                    <Image src={acleyLogo} alt="Acley" width={56} height={56} className={styles.logo} />
                </div>

                {isDone ? (
                    <div className={styles.successState}>
                        <div className={styles.successIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5"/>
                            </svg>
                        </div>
                        <h2 className={styles.successTitle}>Conta criada!</h2>
                        <p className={styles.successSub}>Redirecionando para o login…</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.heading}>
                            <h1 className={styles.title}>Criar conta</h1>
                            <p className={styles.subtitle}>Comece a estudar com inteligência</p>
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
                                <label className={styles.label} htmlFor="username">Nome de usuário</label>
                                <div className={styles.inputWrap}>
                                    <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="4"/>
                                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                                    </svg>
                                    <input
                                        id="username"
                                        className={styles.input}
                                        type="text"
                                        placeholder="seunome"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        autoComplete="username"
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
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className={styles.spinner} />
                                ) : (
                                    <>
                                        Criar conta
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <p className={styles.footer}>
                            Já tem uma conta?{" "}
                            <Link href="/signin" className={styles.footerLink}>
                                Entrar
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}