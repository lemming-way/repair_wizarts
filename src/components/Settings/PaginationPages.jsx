import style from "./PaginationPages.module.css"

export default function PaginationPages() {
    return (
        <>
            <div className={style.wrap}>
                {[1,2,3,4,5, "...", 16, ">"].map(page =>
                    <div className={style.btn}>{page}</div>
                )}
            </div>
        </>
    )
}