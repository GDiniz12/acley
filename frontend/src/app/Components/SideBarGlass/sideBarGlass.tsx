"use client";

import { useState, useEffect } from "react";
import GlassBox from "../GlassBox/GlassBox";
import styles from "./style.module.css";
import { getToken } from "@/app/signin/auth";

interface TypeNotebooks{
    id: string;
    name: string;
}

interface TypeUser {
    id: number;
    username: string;
    created_at: string;
}

export default function SideBarGlass() {
    const [isOpen, setIsOpen] = useState(false);
    const [notebooks, setNotebooks] = useState<TypeNotebooks[]>([]);
    const [dataUser, setDataUser] = useState<TypeUser[]>([]);

    useEffect(() => {
        async function userData() {
            try {
                const token = getToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Erro ao carregar dados de usuário');
                }

                const result: TypeUser[] = await res.json();
                setDataUser(result);
            } catch(err) {
                console.error(err);
                alert("Erro ao carregar dados do usuário!");
            }
        }

        userData();
    }, []);

    useEffect(() => {
        const fetchNotebook = async () => {
            try {
                const token = getToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook/user/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });        
                if (!res.ok) {
                    throw new Error('Erro ao carregar notebooks');
                }
        
                const result: TypeNotebooks[] = await res.json();
                setNotebooks(result);
            } catch(err) {
                console.error(err);
                alert("Erro ao carregar notebooks!");
            }
        }

        fetchNotebook();
    }, []);

    function showNotebooks() {
        return (
            <>
                {notebooks.map((notebook) => (
                    <div key={notebook.id} className={styles.notebookItem}>
                        <p className={styles.notebookName}>{notebook.name}</p>
                    </div>
                ))}
            </>
        )
    }
    return (
        <>
            <div className={styles.SideBarGlass} onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}>
                <GlassBox width={isOpen ? "15rem" : "0.5rem"} height="20rem" className={styles.glassBox}>
                    <div className={styles.titleBar}>
                        <h3>Notebooks</h3>
                        <span>+</span>
                    </div>
                    <div className={styles.allNotebooks}>
                        {showNotebooks()}
                    </div>
                </GlassBox>
            </div>
        </>
    );
}