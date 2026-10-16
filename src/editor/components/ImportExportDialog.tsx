interface ImportExportDialogProps {
  onImport: (file: File) => void;
}
export function ImportExportDialog({ onImport }: ImportExportDialogProps) {
  return (
    <label className="import-button">
      JSON 가져오기
      <input
        aria-label="레벨 JSON 가져오기"
        data-testid="level-import"
        type="file"
        accept="application/json,.json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onImport(file);
            event.target.value = "";
          }
        }}
      />
    </label>
  );
}
