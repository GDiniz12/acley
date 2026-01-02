import MainDeck from "../Components/MainDeck/MainDeck";
import ProtectedRoute from "../Components/ProtectedRoute";
import SideBar from "../Components/SideBar/SideBar";
import styles from "./style.module.css";
import "./style.module.css";

function PageContent() {
    return (
        <>
            <div className={styles.content}>
                <div className={styles.leftSide}>
                    <SideBar />
                </div>
                <div className={styles.centerRigthSide}>
                    <MainDeck />
                    <button className={styles.btnCreate}>Criar matéria</button>
                </div>
            </div>            
        </>
    );
}

export default function PageContentProtected() {
    return (
        <ProtectedRoute>
            <PageContent />
        </ProtectedRoute>
    )
}