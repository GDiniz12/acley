'use client'

import styles from "./style.module.css";
import Image from "next/image";
import acleyIcon from "../../assets/sorteador.com.png";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getToken } from "../../signin/auth";
import Link from "next/link";

interface TypeNotebooks{
    id: number;
    name: string;
}

interface TypeUser {
    id: number;
    username: string;
    created_at: string;
}

export default function SideBar() {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [inputs, setInputs] = useState<string[]>([]);
    const [notebooks, setNotebooks] = useState<TypeNotebooks[]>([]);
    const [dataUser, setDataUser] = useState<TypeUser[]>([]);
    const [click, setClick] = useState(false);
    const router = useRouter();
    const lastInputRef = useRef<HTMLInputElement | null>(null);

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
                console.log("Dados do usuário: ", dataUser);
            } catch(err) {
                console.error(err);
                alert("Erro ao carregar dados do usuário!");
            }
        }

        userData();
    }, []);

    useEffect(() => {
        const fecthNotebook = async () => {
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

        fecthNotebook();
    }, []);

    function createModelNotebook() {
        return (
            <>
                <div className={styles.containerNameNotebook}>
                    <p>Digite o novo nome do notebook</p>
                    <input type="text" />
                    <button>Confirmar</button>
                    <button>Cancelar</button>
                </div>
            </>
        )
    }

    async function createNotebook() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "nameNotebook": "Sem título",
                    "idUser": dataUser[0].id
                })
            });

            const data = await res.json();

            router.push(`/content/${data[0].id}`);
        } catch(err) {
            alert("Erro na criação do notebook: " + err);
            return;
        }
    }

    function toggleMenu(): void {
        setIsOpenMenu((prev: boolean) => !prev);
    }

    function addInput() {
        setInputs((prev) => [...prev, ""])
    }

    useEffect(() => {
        if (lastInputRef.current) {
            lastInputRef.current.focus();
        }
        
    }, [inputs]);

    return (
        <>
            <aside className={styles.sideBar}>
                <div className={styles.top}>
                    <Image src={acleyIcon} alt="acley logo" className={styles.acleyLogo}/>
                    <div className={styles.openMenu} onClick={toggleMenu}><div></div></div>
                </div>
                <div className={`${styles.menu} ${isOpenMenu ? styles.show : styles.hide}`}>
                    <div className={styles.topSide}>
                        <h3 className={styles.titleDeck}>Notebooks</h3>
                        <span className={styles.addDeck} onClick={async () => await createNotebook()}>+</span>
                    </div>
                    <div className={styles.bottomSide}>
                        {notebooks?.map((element, index) => {
                            return (
                                <>
                                    <p><Link href={`/content/${element.id}`}>{element.name}</Link></p>
                                </>
                            )
                        })}
                    </div>
                </div>
            </aside>
        </>
    );
}