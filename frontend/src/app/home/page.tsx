import EffectLight from "../Components/EffectLight/EffectLight";
import styles from "./style.module.css";
import GlassBox from "../Components/GlassBox/GlassBox";

export default function HomePage() {
    return (
        <>
        <div className={styles.effects}>
            <GlassBox width={"25rem"} height={"0.5rem"}/>
        </div>
        </>
    );
}