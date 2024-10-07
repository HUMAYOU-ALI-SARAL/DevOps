"use client"
interface Props {
    id?: string;
    outerContainerStyle?: string;
    innerContainerStyle?: string;
    children: React.ReactNode;
}

function Wrapper({ id, children, outerContainerStyle, innerContainerStyle }: Props) {
    return (
        <section id={id} className={`w-full  overflow-hidden ${outerContainerStyle}`}>
            <section className={`w-full h-full max-w-[1380px] mx-auto md:px-10 px-4 ${innerContainerStyle}`}>
                {children}
            </section>
        </section>
    );
}

export default Wrapper;
