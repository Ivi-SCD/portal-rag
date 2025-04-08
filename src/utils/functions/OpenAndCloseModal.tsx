export const openModal = (modalId: string) => {
  const modalComponent = document.getElementById(modalId) as any;
  modalComponent.open();
};

// Fecha o modal de acordo com o id
export const closeModal = (modalId: string) => {
  const modalComponent = document.getElementById(modalId) as any;
  modalComponent.close();
};
