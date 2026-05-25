import { toast } from "react-toastify";

export const handleCopy = async (
  text: string | null | undefined,
  copyObject: string
) => {
  try {
    if (!text) throw new Error();
    await navigator.clipboard.writeText(text);

    toast.success(`${copyObject} berhasil dicopy ke clipboard mu`);
  } catch (error) {
    console.log(error);
    toast.error(`Gagal saat copu ${copyObject}`);
  }
};
