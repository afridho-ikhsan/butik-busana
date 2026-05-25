import TransactionList from "@/components/transaction-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Transaksi Pengguna',
};

async function UserTransactionPage() {
  return <TransactionList />;
}

export default UserTransactionPage;
