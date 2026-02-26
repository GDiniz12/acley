import styles from "./style.module.css";
import React from "react";

type ComponentsType = React.PropsWithChildren<{
    width: string;
    height: string;
    className?: string;
    style?: React.CSSProperties;
}>;

export default function glassBox({
    width,
    height,
    children,
    className = "",
    style = {},
}: ComponentsType) {
    return (
        <div
            className={`${styles.container} ${className}`.trim()}
            style={{ width, height, ...style }}
        >
            {children}
        </div>
    );
}