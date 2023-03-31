function HorizontalAlignCenter(props) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ maxWidth: props.maxWidth, flexGrow: "1", width: "100%" }}>
                {props.children}
            </div>
        </div>
    )
}

export default HorizontalAlignCenter;