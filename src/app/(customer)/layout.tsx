import CartModal from "@/components/cart-modal/cart-modal"
import Footer from "@/components/footer"
import HelpModal from "@/components/help-modal"
import PwaInstallPrompt from "@/components/pwa-install-prompt"

function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Footer />
            <CartModal />
            <HelpModal />
            <PwaInstallPrompt />
        </>
    )
}

export default CustomerLayout
