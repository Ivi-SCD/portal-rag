export const showToastFunction = async (
  appearance: "error" | "success" | "warning",
  message: string
) => {
  const toastContainer = document.querySelector("diana-toast-container");
  if (toastContainer) {
    await customElements.whenDefined("diana-toast-container");
    await toastContainer.showToast({
      appearance,
      message,
      timeToClose: 5000,
      autoClose: true
    });
  }
};
