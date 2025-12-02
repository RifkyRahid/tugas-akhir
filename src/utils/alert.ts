import Swal from "sweetalert2";

export const showLoading = (
  title: string = "Memproses...",
  text: string = "Mohon tunggu sebentar."
) => {
  Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};

export const showSuccess = (title: string, text: string) => {
  return Swal.fire({
    icon: "success",
    title: title,
    text: text,
    timer: 1500,
    showConfirmButton: false,
  });
};

export const showError = (title: string, text: string) => {
  return Swal.fire({
    icon: "error",
    title: title,
    text: text,
  });
};

export const showConfirm = async (
  title: string,
  text: string,
  confirmText: string = "Ya, hapus!"
) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
  });
};
