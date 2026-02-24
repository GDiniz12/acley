import EffectLight from "../Components/EffectLight/EffectLight";
import styles from "./style.module.css";

export default function HomePage() {
    return (
        <>
            <div className={styles.effects}>
                <EffectLight />
                <EffectLight />
                <EffectLight />
                <EffectLight />
                <EffectLight />
                <EffectLight />
            </div>
        </>
    );
}