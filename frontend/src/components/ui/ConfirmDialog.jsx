import Modal from "./Modal";
import Button from "./Button";

function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  return (
    <Modal
      title={title}
      onClose={isLoading ? () => {} : onCancel}
      size="max-w-md"
      role="alertdialog"
    >
      <div className="p-6">
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
