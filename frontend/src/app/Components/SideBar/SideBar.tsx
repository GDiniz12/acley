'use client'

import styles from "./style.module.css";
import Image from "next/image";
import acleyIcon from "../../assets/sorteador.com.png";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getToken } from "../../signin/auth";
import NotebookComponent from "../NotebookComponent/NotebookComponent";

interface TypeNotebooks{
    id: string;
    name: string;
}

interface TypeUser {
    id: number;
    username: string;
    created_at: string;
}

export default function SideBar() {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [notebooks, setNotebooks] = useState<TypeNotebooks[]>([]);
    const [dataUser, setDataUser] = useState<TypeUser[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'rename' | 'delete'>('rename');
    const [selectedNotebook, setSelectedNotebook] = useState<TypeNotebooks | null>(null);
    const [newName, setNewName] = useState('');
    const router = useRouter();

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

    async function createNotebook() {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    "nameNotebook": "Sem título",
                    "idUser": dataUser[0].id
                })
            });

            const data = await res.json();
            setNotebooks(prev => [...prev, data[0]]);
            router.push(`/content/${data[0].id}`);
        } catch(err) {
            alert("Erro na criação do notebook: " + err);
            return;
        }
    }

    function toggleMenu(): void {
        setIsOpenMenu((prev: boolean) => !prev);
    }

    function handleOpenRenameModal(notebook: TypeNotebooks) {
        setSelectedNotebook(notebook);
        setNewName(notebook.name);
        setModalType('rename');
        setShowModal(true);
    }

    function handleOpenDeleteModal(notebook: TypeNotebooks) {
        setSelectedNotebook(notebook);
        setModalType('delete');
        setShowModal(true);
    }

    function handleCloseModal() {
        setShowModal(false);
        setSelectedNotebook(null);
        setNewName('');
    }

    async function handleRenameNotebook() {
        if (!selectedNotebook || !newName.trim()) {
            alert("Por favor, insira um nome válido!");
            return;
        }

        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook/${selectedNotebook.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    newName: newName.trim()
                })
            });

            if (!res.ok) {
                throw new Error('Erro ao renomear notebook');
            }

            setNotebooks(prev => 
                prev.map(nb => 
                    nb.id === selectedNotebook.id 
                        ? { ...nb, name: newName.trim() }
                        : nb
                )
            );

            handleCloseModal();
        } catch(err) {
            console.error(err);
            alert("Erro ao renomear notebook!");
        }
    }

    async function handleDeleteNotebook() {
        if (!selectedNotebook) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook/${selectedNotebook.id}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                throw new Error('Erro ao excluir notebook');
            }

            setNotebooks(prev => prev.filter(nb => nb.id !== selectedNotebook.id));
            handleCloseModal();
        } catch(err) {
            console.error(err);
            alert("Erro ao excluir notebook!");
        }
    }

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
                        {notebooks?.map((element) => {
                            return (
                                <NotebookComponent 
                                    key={element.id}
                                    link={element.id} 
                                    title={element.name}
                                    onRename={() => handleOpenRenameModal(element)}
                                    onDelete={() => handleOpenDeleteModal(element)}
                                />
                            )
                        })}
                    </div>
                </div>
            </aside>

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {modalType === 'rename' ? (
                            <>
                                <h2>Renomear Notebook</h2>
                                <p>Digite o novo nome do notebook</p>
                                <input 
                                    type="text" 
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Nome do notebook"
                                    className={styles.modalInput}
                                    autoFocus
                                />
                                <div className={styles.modalButtons}>
                                    <button 
                                        onClick={handleRenameNotebook}
                                        className={styles.confirmButton}
                                    >
                                        Confirmar
                                    </button>
                                    <button 
                                        onClick={handleCloseModal}
                                        className={styles.cancelButton}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2>Excluir Notebook</h2>
                                <p>Tem certeza que deseja excluir o notebook "<strong>{selectedNotebook?.name}</strong>"?</p>
                                <p className={styles.warningText}>Esta ação não pode ser desfeita.</p>
                                <div className={styles.modalButtons}>
                                    <button 
                                        onClick={handleDeleteNotebook}
                                        className={styles.deleteButton}
                                    >
                                        Excluir
                                    </button>
                                    <button 
                                        onClick={handleCloseModal}
                                        className={styles.cancelButton}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}