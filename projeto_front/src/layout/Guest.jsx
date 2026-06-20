import Footer from "../components/Footer/footer.jsx"
import Header from "../components/Header/Header.jsx"

const Guest = ({ children }) => {
    return (
        <>
            <Header />
            <main className="guest_main">
                <div>
                    {children}
                </div>
            </main>
            <Footer/>
        </>
    )
}

export default Guest