"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./landing.module.css";
import acleyLogo from "./assets/newAcleyLogo-removebg-preview.png";

export default function LandingPage() {
    const [currentWord, setCurrentWord] = useState(0);
    const words = ["Aprenda", "Memorize", "Domine", "Conquiste"];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % words.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>
            {/* Animated Background */}
            <div className={styles.backgroundAnimation}>
                <div className={styles.card}></div>
                <div className={styles.card}></div>
                <div className={styles.card}></div>
                <div className={styles.card}></div>
                <div className={styles.card}></div>
            </div>

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Image src={acleyLogo} alt="Acley" width={60} height={60} />
                </div>
                <nav className={styles.nav}>
                    <Link href="/signin" className={styles.navLink}>
                        Entrar
                    </Link>
                    <Link href="/signup" className={styles.navButton}>
                        Começar Grátis
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className={styles.main}>
                <div className={styles.hero}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            <span className={styles.wordContainer}>
                                {words.map((word, index) => (
                                    <span
                                        key={word}
                                        className={`${styles.word} ${
                                            index === currentWord ? styles.wordActive : ""
                                        }`}
                                    >
                                        {word}
                                    </span>
                                ))}
                            </span>
                            <br />
                            <span className={styles.gradient}>Com Inteligência</span>
                        </h1>
                        <p className={styles.heroDescription}>
                            Revolucione seus estudos com flashcards inteligentes e 
                            repetição espaçada. Aprenda mais rápido, lembre por mais tempo.
                        </p>
                        <div className={styles.heroButtons}>
                            <Link href="/signup" className={styles.primaryButton}>
                                Começar Agora
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M7.5 15L12.5 10L7.5 5"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>
                            <Link href="/signin" className={styles.secondaryButton}>
                                Já tenho conta
                            </Link>
                        </div>
                    </div>

                    {/* Animated Cards Preview */}
                    <div className={styles.heroVisual}>
                        <div className={styles.floatingCard}>
                            <div className={styles.cardFront}>
                                <div className={styles.cardLabel}>Pergunta</div>
                                <div className={styles.cardText}>
                                    O que é repetição espaçada?
                                </div>
                            </div>
                        </div>
                        <div className={`${styles.floatingCard} ${styles.floatingCard2}`}>
                            <div className={styles.cardBack}>
                                <div className={styles.cardLabel}>Resposta</div>
                                <div className={styles.cardText}>
                                    Técnica de estudo que aumenta intervalos de revisão
                                </div>
                            </div>
                        </div>
                        <div className={`${styles.floatingCard} ${styles.floatingCard3}`}>
                            <div className={styles.cardFront}>
                                <div className={styles.cardLabel}>Pergunta</div>
                                <div className={styles.cardText}>
                                    Quais os benefícios?
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <section className={styles.features}>
                    <h2 className={styles.sectionTitle}>
                        Por que escolher o <span className={styles.gradient}>Acley?</span>
                    </h2>
                    <div className={styles.featuresGrid}>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                                    <path d="M2 17L12 22L22 17" />
                                    <path d="M2 12L12 17L22 12" />
                                </svg>
                            </div>
                            <h3 className={styles.featureTitle}>Organize por Matérias</h3>
                            <p className={styles.featureDescription}>
                                Crie notebooks, matérias e submatérias para manter 
                                seus estudos perfeitamente organizados.
                            </p>
                        </div>

                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <h3 className={styles.featureTitle}>Repetição Inteligente</h3>
                            <p className={styles.featureDescription}>
                                Algoritmo de repetição espaçada que otimiza seus 
                                intervalos de revisão automaticamente.
                            </p>
                        </div>

                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                            </div>
                            <h3 className={styles.featureTitle}>Progresso Visual</h3>
                            <p className={styles.featureDescription}>
                                Acompanhe seus cards novos, em aprendizado e 
                                prontos para revisão em tempo real.
                            </p>
                        </div>

                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <rect x="3" y="3" width="7" height="7" />
                                    <rect x="14" y="3" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                </svg>
                            </div>
                            <h3 className={styles.featureTitle}>Interface Minimalista</h3>
                            <p className={styles.featureDescription}>
                                Design limpo e intuitivo para você focar no que 
                                realmente importa: aprender.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Final */}
                <section className={styles.cta}>
                    <h2 className={styles.ctaTitle}>
                        Pronto para transformar seus estudos?
                    </h2>
                    <p className={styles.ctaDescription}>
                        Junte-se a milhares de estudantes que já melhoraram 
                        sua performance com o Acley.
                    </p>
                    <Link href="/signup" className={styles.ctaButton}>
                        Criar Conta Grátis
                    </Link>
                </section>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>© 2026 Acley</p>
            </footer>
        </div>
    );
}