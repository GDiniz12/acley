'use client'

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./Setting.module.css";
import { getToken, removeToken } from "../../signin/auth";

interface UserData {
    id: number;
    username: string;
    email?: string;
    created_at: string;
}

export default function Settings() {
    const [isOpen, setIsOpen] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            fetchUserData();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    async function fetchUserData() {
        setIsLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Erro ao carregar dados do usuário');
            }

            const result = await res.json();
            setUserData(result[0]);
        } catch(err) {
            console.error("Erro ao buscar dados do usuário:", err);
            alert("Erro ao carregar informações do usuário!");
        } finally {
            setIsLoading(false);
        }
    }

    function handleToggleSettings() {
        setIsOpen(!isOpen);
    }

    function handleLogout() {
        const confirm = window.confirm("Tem certeza que deseja sair?");
        if (confirm) {
            removeToken();
            router.push("/signin");
        }
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    return (
        <div className={styles.settingsContainer} ref={menuRef}>
            <button 
                className={styles.settingsButton}
                onClick={handleToggleSettings}
                title="Configurações"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6m-9-9h6m6 0h6"/>
                    <path d="M3.34 8.34l4.24 4.24m8.84 0l4.24 4.24M8.34 16.66l4.24-4.24m0-8.84l4.24-4.24"/>
                </svg>
            </button>

            {isOpen && (
                <div className={styles.settingsPanel}>
                    <div className={styles.panelHeader}>
                        <h3>Configurações</h3>
                        <button 
                            className={styles.closeButton}
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className={styles.panelContent}>
                        {isLoading ? (
                            <div className={styles.loading}>Carregando...</div>
                        ) : userData ? (
                            <>
                                <div className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Informações Pessoais</h4>
                                    
                                    <div className={styles.infoGroup}>
                                        <div className={styles.infoLabel}>Nome de usuário</div>
                                        <div className={styles.infoValue}>{userData.username}</div>
                                    </div>

                                    {userData.email && (
                                        <div className={styles.infoGroup}>
                                            <div className={styles.infoLabel}>Email</div>
                                            <div className={styles.infoValue}>{userData.email}</div>
                                        </div>
                                    )}

                                    <div className={styles.infoGroup}>
                                        <div className={styles.infoLabel}>Membro desde</div>
                                        <div className={styles.infoValue}>
                                            {formatDate(userData.created_at)}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.divider}></div>

                                <div className={styles.section}>
                                    <button 
                                        className={styles.logoutButton}
                                        onClick={handleLogout}
                                    >
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="20" 
                                            height="20" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        >
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                            <polyline points="16 17 21 12 16 7"/>
                                            <line x1="21" y1="12" x2="9" y2="12"/>
                                        </svg>
                                        Sair
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className={styles.error}>
                                Erro ao carregar dados do usuário
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}