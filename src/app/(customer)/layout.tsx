import CartModal from "@/components/cart-modal/cart-modal"
import HelpModal from "@/components/help-modal"
import PwaInstallPrompt from "@/components/pwa-install-prompt"

function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <CartModal />
            <HelpModal />
            <PwaInstallPrompt />
        </>
    )
}

export default CustomerLayout
