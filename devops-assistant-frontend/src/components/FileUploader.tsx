'use client';

import { useState } from 'react';

export default function FileUploader() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileNames = Array.from(files).map((file) => file.name);
    setSelectedFiles(fileNames);
  };

  return (
    <section className="rounded-xl border border-slate-200 p-6">
      <label className="block text-sm font-medium text-slate-700">Upload source files</label>
      <input
        type="file"
        multiple
        onChange={(event) => handleFiles(event.target.files)}
        className="mt-3 block w-full rounded-lg border border-slate-300 bg-white p-3"
      />
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-1">
          <p className="text-sm font-semibold">Selected files:</p>
          <ul className="list-disc pl-5 text-sm text-slate-600">
            {selectedFiles.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
